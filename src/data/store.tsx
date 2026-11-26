import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import * as repo from '@/db/repo';
import { openDatabase } from '@/db/open';
import type { SqlDb } from '@/db/sql';
import { STARTER_CATEGORIES } from '@/domain/categories';
import { monthKey } from '@/domain/dates';
import type { AppearanceMode, Category, CurrencyCode, Expense, SetupMode } from '@/domain/types';
import { reportError } from '@/lib/report';

import { WriteQueue } from './write-queue';

/*
 * The store: expo-sqlite on the device is where the data lives and the only thing screens read.
 * Screens never touch the database; they use the hooks here and in ./expenses.ts.
 *
 * - On launch the database opens and migrates; until then `ready` is false, and if it fails
 *   `error` is set and `retry()` tries again (the root layout shows a calm screen for both).
 * - Mutators are async. They resolve after the write is saved, so screens show toasts and move on
 *   only once it is; they reject if it fails, and nothing on screen changes.
 * - Writes go through one queue, one at a time, in the order they were made.
 * - Every write bumps `version`; the read hooks re-query when it changes.
 */

/** "Ada Obi", or whichever part is set; empty when neither is. */
export function fullName(s: Pick<Settings, 'firstName' | 'lastName'>): string {
  return [s.firstName, s.lastName].map((x) => x.trim()).filter(Boolean).join(' ');
}

/** The user's currencies: the main one first, then the optional second. */
export function chosenCurrencies(s: Pick<Settings, 'currency' | 'secondCurrency'>): CurrencyCode[] {
  return s.secondCurrency && s.secondCurrency !== s.currency ? [s.currency, s.secondCurrency] : [s.currency];
}

export type Settings = {
  /** Main currency: totals, budgets and new expenses start in it. */
  currency: CurrencyCode;
  /** Optional second currency, tracked separately and never converted; null when there is none. */
  secondCurrency: CurrencyCode | null;
  appearance: AppearanceMode;
  mode: SetupMode;
  reminderOn: boolean;
  reminderTime: string;
  firstName: string;
  lastName: string;
  email: string;
};

/** A fresh account's settings. Deleting the account returns to these. */
export const DEFAULT_SETTINGS: Settings = {
  currency: 'NGN',
  secondCurrency: null,
  appearance: 'system',
  mode: 'track',
  reminderOn: true,
  reminderTime: '20:00',
  firstName: '',
  lastName: '',
  email: '',
};

type State = {
  categories: Category[];
  settings: Settings;
  signedIn: boolean;
};

export type Actions = {
  addExpense: (e: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  /** False when the expense was deleted meanwhile. */
  updateExpense: (e: Expense) => Promise<boolean>;
  /**
   * Soft delete: the expense disappears from every screen but stays as a tombstone, so a later
   * sync can pass the delete on. Resolves to the expense (for Undo), or undefined if it was
   * already gone. Every change also writes an outbox row, ready for sync (part B).
   */
  deleteExpense: (id: string) => Promise<Expense | undefined>;
  /** Undo: brings a deleted expense back, newer than its delete so a sync can't undo the Undo. */
  restoreExpense: (e: Expense) => Promise<void>;
  saveCategory: (c: Omit<Category, 'id'> & { id?: string }) => Promise<Category>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  /** Development only: replaces the expenses with 10,000 generated ones (see data/stress.ts). */
  loadStressData: () => Promise<void>;
};

type Status = { ready: boolean; error: Error | null; retry: () => void };

const StateCtx = createContext<State | null>(null);
const ActionsCtx = createContext<Actions | null>(null);
const StatusCtx = createContext<Status | null>(null);
/** The open database and the data version, for the read hooks in src/data only. */
const DbCtx = createContext<{ db: SqlDb; version: number } | null>(null);

export const newId = (): string => Crypto.randomUUID();

const freshState = (): State => ({
  categories: STARTER_CATEGORIES.map((c) => ({ ...c })),
  settings: { ...DEFAULT_SETTINGS },
  signedIn: false,
});

function applySettings(current: Settings, patch: Partial<Settings>): Settings {
  const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  const settings: Settings = { ...current, ...defined };
  // The two currencies are always different: making the second one main clears the second.
  if (settings.secondCurrency === settings.currency) settings.secondCurrency = null;
  return settings;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SqlDb | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>(freshState);
  const [version, setVersion] = useState(0);

  // Latest values for actions, which are built once.
  const dbRef = useRef<SqlDb | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;
    openDatabase()
      .then((opened) => {
        if (cancelled) return void opened.closeAsync().catch(() => {});
        dbRef.current = opened;
        setDb(opened);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        reportError(e, { where: 'open database' });
        setError(e instanceof Error ? e : new Error(String(e)));
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  // Actions are built once: their identities never change, so components that only write never
  // re-render when the data changes.
  const actions = useMemo<Actions>(() => {
    const queue = new WriteQueue();
    /** Runs writes one at a time; a failed write rejects its own promise but not the next one. */
    const write = <T,>(task: (db: SqlDb) => Promise<T>): Promise<T> =>
      queue.run(() => {
        const current = dbRef.current;
        if (!current) return Promise.reject(new Error('The database is not open'));
        return task(current);
      });
    const changed = () => setVersion((v) => v + 1);
    const setLocal = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
    const upsert = (list: Category[], category: Category) =>
      list.some((c) => c.id === category.id) ? list.map((c) => (c.id === category.id ? category : c)) : [...list, category];

    return {
      addExpense: (input) =>
        write(async (d) => {
          const now = Date.now();
          const expense: Expense = { ...input, id: newId(), createdAt: now, updatedAt: now };
          await repo.insertExpense(d, expense);
          changed();
          return expense;
        }),
      updateExpense: (e) =>
        write(async (d) => {
          const ok = await repo.updateExpense(d, { ...e, updatedAt: Date.now() });
          if (ok) changed();
          return ok;
        }),
      deleteExpense: (id) =>
        write(async (d) => {
          const removed = await repo.deleteExpense(d, id, Date.now());
          if (removed) changed();
          return removed;
        }),
      restoreExpense: (expense) =>
        write(async (d) => {
          if (await repo.restoreExpense(d, expense.id, Date.now())) changed();
        }),
      saveCategory: (input) =>
        write(async () => {
          const category: Category = { ...input, id: input.id ?? newId() };
          setState((s) => ({ ...s, categories: upsert(s.categories, category) }));
          return category;
        }),
      updateSettings: (patch) =>
        write(async () => {
          setState((s) => ({ ...s, settings: applySettings(s.settings, patch) }));
        }),
      signIn: () => write(async () => setLocal({ signedIn: true })),
      signOut: () => write(async () => setLocal({ signedIn: false })),
      deleteAccount: () =>
        write(async (d) => {
          await repo.wipeAll(d);
          // Starter categories with no budget, and default settings: no name, email or preferences
          // survive account deletion.
          setState(freshState());
          changed();
        }),
      loadStressData: () =>
        write(async (d) => {
          // Inside `if (__DEV__)` so production builds fold the block away, require and all: the
          // generator never ships.
          if (__DEV__) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { makeStressExpenses } = require('./stress') as typeof import('./stress');
            const expenses = makeStressExpenses({
              lastMonth: monthKey(new Date()),
              main: stateRef.current.settings.currency,
              categoryIds: stateRef.current.categories.map((c) => c.id),
            });
            await repo.replaceAllExpenses(d, expenses);
            changed();
          }
        }),
    };
  }, []);

  const status = useMemo<Status>(() => ({ ready: db !== null, error, retry }), [db, error, retry]);
  const dbValue = useMemo(() => (db ? { db, version } : null), [db, version]);

  return (
    <StatusCtx.Provider value={status}>
      <ActionsCtx.Provider value={actions}>
        <StateCtx.Provider value={state}>
          <DbCtx.Provider value={dbValue}>{children}</DbCtx.Provider>
        </StateCtx.Provider>
      </ActionsCtx.Provider>
    </StatusCtx.Provider>
  );
}

export function useStore(): State {
  const s = useContext(StateCtx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

export function useActions(): Actions {
  const a = useContext(ActionsCtx);
  if (!a) throw new Error('useActions must be used inside StoreProvider');
  return a;
}

/** Whether the database is open (`ready`), failed to open (`error`), and a way to try again. */
export function useStoreStatus(): Status {
  const s = useContext(StatusCtx);
  if (!s) throw new Error('useStoreStatus must be used inside StoreProvider');
  return s;
}

/**
 * For the read hooks in src/data: the open database and the data version (it changes after every
 * write, so a query keyed on it re-runs). Only rendered once the database is ready.
 */
export function useDb(): { db: SqlDb; version: number } {
  const v = useContext(DbCtx);
  if (!v) throw new Error('useDb is only available once the database is open');
  return v;
}

export function useCategory(id: string | undefined): Category | undefined {
  const { categories } = useStore();
  return categories.find((c) => c.id === id);
}
