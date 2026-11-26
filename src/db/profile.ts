import type { Category, CurrencyCode } from '@/domain/types';

import { enqueueChange } from './repo';
import type { SqlDb } from './sql';

/*
 * Categories, settings, sign-in state and setup progress, saved so they survive a restart.
 *
 * - Categories are rows of `categories`, in `position` order. The starter set is written the
 *   first time the app opens (and again after account deletion).
 * - Settings are rows of `settings`: id is the setting's name, value is JSON. Only names this
 *   build knows are read back, so an old or unknown row can't break anything.
 * - Sign-in state and setup progress are device-only: they never go to the outbox.
 */

type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  budget: number | null;
  budget_currency: string | null;
  built_in: number;
  hidden: number;
  version: number;
};

const toCategory = (r: CategoryRow): Category => ({
  id: r.id,
  name: r.name,
  icon: r.icon as Category['icon'],
  budget: r.budget,
  ...(r.budget_currency ? { budgetCurrency: r.budget_currency as CurrencyCode } : null),
  builtIn: r.built_in === 1,
  ...(r.hidden ? { hidden: true } : null),
});

/** Every category, in the order it was added (starters first). */
export function loadCategories(db: SqlDb): Category[] {
  return db
    .getAllSync<CategoryRow>(
      `SELECT id, name, icon, budget, budget_currency, built_in, hidden, version FROM categories WHERE deleted_at IS NULL ORDER BY position, created_at`,
    )
    .map(toCategory);
}

/** Writes the starter categories when there are none (first launch, or after account deletion). */
export async function seedCategories(db: SqlDb, starters: readonly Category[], now: number): Promise<void> {
  const any = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM categories`);
  if (any && any.n > 0) return;
  await db.withTransactionAsync(async () => {
    for (const [i, c] of starters.entries()) {
      await db.runAsync(
        `INSERT INTO categories (id, name, icon, budget, budget_currency, built_in, hidden, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c.id,
        c.name,
        c.icon,
        c.budget,
        c.budgetCurrency ?? null,
        c.builtIn ? 1 : 0,
        c.hidden ? 1 : 0,
        i,
        now,
        now,
      );
    }
  });
}

/** Creates or updates a category, with an outbox row. */
export async function saveCategory(db: SqlDb, c: Category, now: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    const before = await db.getFirstAsync<{ version: number }>(`SELECT version FROM categories WHERE id = ?`, c.id);
    if (before) {
      await db.runAsync(
        `UPDATE categories SET name = ?, icon = ?, budget = ?, budget_currency = ?, built_in = ?, hidden = ?, updated_at = ?, deleted_at = NULL, version = version + 1 WHERE id = ?`,
        c.name,
        c.icon,
        c.budget,
        c.budget !== null ? (c.budgetCurrency ?? null) : null,
        c.builtIn ? 1 : 0,
        c.hidden ? 1 : 0,
        now,
        c.id,
      );
    } else {
      const last = await db.getFirstAsync<{ p: number | null }>(`SELECT MAX(position) AS p FROM categories`);
      await db.runAsync(
        `INSERT INTO categories (id, name, icon, budget, budget_currency, built_in, hidden, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c.id,
        c.name,
        c.icon,
        c.budget,
        c.budget !== null ? (c.budgetCurrency ?? null) : null,
        c.builtIn ? 1 : 0,
        c.hidden ? 1 : 0,
        (last?.p ?? -1) + 1,
        now,
        now,
      );
    }
    const row = await db.getFirstAsync(
      `SELECT id, name, icon, budget, budget_currency, built_in, hidden, version, created_at, updated_at, deleted_at FROM categories WHERE id = ?`,
      c.id,
    );
    await enqueueChange(db, 'category', c.id, before ? 'update' : 'create', row, before?.version ?? null, now);
  });
}

/** Every saved setting, as name → value. */
export function loadSettings(db: SqlDb): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const r of db.getAllSync<{ id: string; value: string }>(`SELECT id, value FROM settings WHERE deleted_at IS NULL`)) {
    try {
      out[r.id] = JSON.parse(r.value);
    } catch {
      // A damaged value is skipped; the default stays.
    }
  }
  return out;
}

/**
 * Saves several settings in one transaction. `synced` settings (the user's preferences) also get
 * an outbox row each; device-only ones (signed in, setup progress) don't.
 */
export async function saveSettings(db: SqlDb, values: Record<string, unknown>, now: number, synced: boolean): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const [id, value] of Object.entries(values)) {
      const json = JSON.stringify(value ?? null);
      await db.runAsync(
        `INSERT INTO settings (id, value, created_at, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, deleted_at = NULL`,
        id,
        json,
        now,
        now,
      );
      if (synced) await enqueueChange(db, 'setting', id, 'update', { id, value: value ?? null, updated_at: now }, null, now);
    }
  });
}
