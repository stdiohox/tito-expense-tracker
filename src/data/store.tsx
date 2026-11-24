import * as Crypto from 'expo-crypto';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { STARTER_CATEGORIES } from '@/domain/categories';
import type { AppearanceMode, Category, CurrencyCode, Expense } from '@/domain/types';

import { SAMPLE_CATEGORIES, sampleExpenses } from './sample';

/*
 * Phase-1 store: in memory, seeded with sample data. Phase 2 replaces the backing with
 * expo-sqlite (the single read source) plus an outbox that syncs to Supabase. Screens only
 * talk to the hooks below. Known phase-2 changes (see tasks/todo.md): async mutators with
 * a ready/error state, soft deletes with tombstones, and aggregates computed in SQL.
 */

export type Settings = {
  currency: CurrencyCode;
  appearance: AppearanceMode;
  reminderOn: boolean;
  reminderTime: string;
  firstName: string;
  email: string;
};

/** A fresh account's settings. Deleting the account returns to these. */
export const DEFAULT_SETTINGS: Settings = {
  currency: 'NGN',
  appearance: 'system',
  reminderOn: true,
  reminderTime: '20:00',
  firstName: '',
  email: '',
};

type State = {
  expenses: Expense[];
  categories: Category[];
  settings: Settings;
  signedIn: boolean;
};

type Action =
  | { type: 'add'; expense: Expense }
  | { type: 'update'; expense: Expense }
  | { type: 'delete'; id: string }
  | { type: 'restore'; expense: Expense }
  | { type: 'upsertCategory'; category: Category }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'signIn' }
  | { type: 'signOut' }
  | { type: 'wipe' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
    case 'restore':
      return { ...state, expenses: [action.expense, ...state.expenses.filter((e) => e.id !== action.expense.id)] };
    case 'update':
      return { ...state, expenses: state.expenses.map((e) => (e.id === action.expense.id ? action.expense : e)) };
    case 'delete':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    case 'upsertCategory': {
      const exists = state.categories.some((c) => c.id === action.category.id);
      return {
        ...state,
        categories: exists
          ? state.categories.map((c) => (c.id === action.category.id ? action.category : c))
          : [...state.categories, action.category],
      };
    }
    case 'settings': {
      const patch = Object.fromEntries(Object.entries(action.patch).filter(([, v]) => v !== undefined));
      return { ...state, settings: { ...state.settings, ...patch } };
    }
    case 'signIn':
      return { ...state, signedIn: true };
    case 'signOut':
      return { ...state, signedIn: false };
    case 'wipe':
      // Starter categories with no budget (and no budgetCurrency), and default settings: no name,
      // email or preferences survive account deletion.
      return {
        expenses: [],
        categories: STARTER_CATEGORIES.map((c) => ({ ...c })),
        settings: { ...DEFAULT_SETTINGS },
        signedIn: false,
      };
  }
}

export type Actions = {
  addExpense: (e: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Expense;
  updateExpense: (e: Expense) => boolean;
  deleteExpense: (id: string) => Expense | undefined;
  restoreExpense: (e: Expense) => void;
  saveCategory: (c: Omit<Category, 'id'> & { id?: string }) => Category;
  updateSettings: (patch: Partial<Settings>) => void;
  signIn: () => void;
  signOut: () => void;
  deleteAccount: () => void;
};

const StateCtx = createContext<State | null>(null);
const ActionsCtx = createContext<Actions | null>(null);

export const newId = (): string => Crypto.randomUUID();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    expenses: sampleExpenses(),
    categories: SAMPLE_CATEGORIES,
    settings: { ...DEFAULT_SETTINGS, firstName: 'Ada', email: 'ada@example.com' },
    signedIn: true,
  }));
  // Latest state for actions that must answer "did it exist?" without stale closures.
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);

  // Built once: action identities never change, so consumers of actions never re-render for them.
  const actions = useMemo<Actions>(
    () => ({
      addExpense: (input) => {
        const now = Date.now();
        const expense: Expense = { ...input, id: newId(), createdAt: now, updatedAt: now };
        dispatch({ type: 'add', expense });
        return expense;
      },
      updateExpense: (e) => {
        if (!latest.current.expenses.some((x) => x.id === e.id)) return false;
        dispatch({ type: 'update', expense: { ...e, updatedAt: Date.now() } });
        return true;
      },
      deleteExpense: (id) => {
        const found = latest.current.expenses.find((e) => e.id === id);
        if (!found) return undefined;
        latest.current = { ...latest.current, expenses: latest.current.expenses.filter((e) => e.id !== id) };
        dispatch({ type: 'delete', id });
        return found;
      },
      restoreExpense: (expense) => dispatch({ type: 'restore', expense: { ...expense, updatedAt: Date.now() } }),
      saveCategory: (input) => {
        const category: Category = { ...input, id: input.id ?? newId() };
        dispatch({ type: 'upsertCategory', category });
        return category;
      },
      updateSettings: (patch) => dispatch({ type: 'settings', patch }),
      signIn: () => dispatch({ type: 'signIn' }),
      signOut: () => dispatch({ type: 'signOut' }),
      deleteAccount: () => dispatch({ type: 'wipe' }),
    }),
    [],
  );

  return (
    <ActionsCtx.Provider value={actions}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </ActionsCtx.Provider>
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

export function useCategory(id: string | undefined): Category | undefined {
  const { categories } = useStore();
  return categories.find((c) => c.id === id);
}
