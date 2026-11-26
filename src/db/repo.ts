import { toDayKey } from '@/domain/dates';
import { isKnownCurrency } from '@/domain/money';
import type { CurrencyCode, DayKey, Expense, MonthKey } from '@/domain/types';

import type { SqlDb } from './sql';

/*
 * Every read and write of the app's data, as plain functions over a database. Only src/data calls
 * these; screens go through the hooks there.
 *
 * Reads are synchronous (indexed, small results) so screens render straight from SQLite.
 * Writes are async; each runs in a transaction.
 */

type ExpenseRow = {
  id: string;
  amount: number;
  currency: string;
  category_id: string;
  day: string;
  note: string;
  created_at: number;
  updated_at: number;
};

const EXPENSE_COLUMNS = 'id, amount, currency, category_id, day, note, created_at, updated_at';
/** Rows that are not deleted. */
const LIVE = 'deleted_at IS NULL';

const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  amount: r.amount,
  currency: r.currency as CurrencyCode,
  categoryId: r.category_id,
  day: r.day as DayKey,
  note: r.note,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/** First and last possible key of a month: `day BETWEEN` these uses the index on day. */
export const monthBounds = (m: MonthKey): [string, string] => [`${m}-00`, `${m}-99`];

/** Rejects data the app should never store: a bad amount, day or currency. */
export function checkExpense(e: Pick<Expense, 'amount' | 'currency' | 'day' | 'categoryId'>): void {
  if (!Number.isSafeInteger(e.amount) || e.amount <= 0) throw new Error('Amount must be a positive whole number of minor units');
  if (!toDayKey(e.day)) throw new Error('Day must be a real calendar day');
  if (!isKnownCurrency(e.currency)) throw new Error('Unknown currency');
  if (!e.categoryId) throw new Error('Category is required');
}

// ---------------------------------------------------------------------------------------------
// Expense reads
// ---------------------------------------------------------------------------------------------

/** One month's expenses, newest day first (newest entry first within a day); one currency if given. */
export function monthExpenses(db: SqlDb, month: MonthKey, currency?: CurrencyCode): Expense[] {
  const [from, to] = monthBounds(month);
  const rows = currency
    ? db.getAllSync<ExpenseRow>(
        `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE ${LIVE} AND day BETWEEN ? AND ? AND currency = ? ORDER BY day DESC, created_at DESC`,
        from,
        to,
        currency,
      )
    : db.getAllSync<ExpenseRow>(
        `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE ${LIVE} AND day BETWEEN ? AND ? ORDER BY day DESC, created_at DESC`,
        from,
        to,
      );
  return rows.map(toExpense);
}

/** The latest few expenses of a month, in any currency. */
export function recentExpenses(db: SqlDb, month: MonthKey, limit: number): Expense[] {
  const [from, to] = monthBounds(month);
  return db
    .getAllSync<ExpenseRow>(
      `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE ${LIVE} AND day BETWEEN ? AND ? ORDER BY day DESC, created_at DESC LIMIT ?`,
      from,
      to,
      limit,
    )
    .map(toExpense);
}

/** One category's expenses in one currency and month, newest first. */
export function categoryExpenses(db: SqlDb, categoryId: string, currency: CurrencyCode, month: MonthKey): Expense[] {
  const [from, to] = monthBounds(month);
  return db
    .getAllSync<ExpenseRow>(
      `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE ${LIVE} AND category_id = ? AND currency = ? AND day BETWEEN ? AND ? ORDER BY day DESC, created_at DESC`,
      categoryId,
      currency,
      from,
      to,
    )
    .map(toExpense);
}

export function getExpense(db: SqlDb, id: string): Expense | undefined {
  const row = db.getFirstSync<ExpenseRow>(`SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE ${LIVE} AND id = ?`, id);
  return row ? toExpense(row) : undefined;
}

export function countExpenses(db: SqlDb): number {
  return db.getFirstSync<{ n: number }>(`SELECT COUNT(*) AS n FROM expenses WHERE ${LIVE}`)?.n ?? 0;
}

/** Every currency that has at least one expense. */
export function usedCurrencies(db: SqlDb): CurrencyCode[] {
  // As stored: an older code no longer on the list still comes back, so its expenses stay visible.
  return db.getAllSync<{ currency: CurrencyCode }>(`SELECT DISTINCT currency FROM expenses WHERE ${LIVE}`).map((r) => r.currency);
}

/** The month of the earliest expense, or null when there are none. */
export function firstMonth(db: SqlDb): MonthKey | null {
  const d = db.getFirstSync<{ d: string | null }>(`SELECT MIN(day) AS d FROM expenses WHERE ${LIVE}`)?.d;
  return d ? (d.slice(0, 7) as MonthKey) : null;
}

// ---------------------------------------------------------------------------------------------
// Expense writes
// ---------------------------------------------------------------------------------------------

export async function insertExpense(db: SqlDb, e: Expense): Promise<void> {
  checkExpense(e);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO expenses (id, amount, currency, category_id, day, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      e.id,
      e.amount,
      e.currency,
      e.categoryId,
      e.day,
      e.note,
      e.createdAt,
      e.updatedAt,
    );
  });
}

/** Saves an edit. False when the expense no longer exists (deleted meanwhile). */
export async function updateExpense(db: SqlDb, e: Expense): Promise<boolean> {
  checkExpense(e);
  let changed = false;
  await db.withTransactionAsync(async () => {
    const r = await db.runAsync(
      `UPDATE expenses SET amount = ?, currency = ?, category_id = ?, day = ?, note = ?, updated_at = ?, version = version + 1 WHERE id = ? AND ${LIVE}`,
      e.amount,
      e.currency,
      e.categoryId,
      e.day,
      e.note,
      e.updatedAt,
      e.id,
    );
    changed = r.changes > 0;
  });
  return changed;
}

/** Deletes an expense and returns it (for Undo), or undefined when it was already gone. */
export async function deleteExpense(db: SqlDb, id: string, _now: number): Promise<Expense | undefined> {
  let found: Expense | undefined;
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<ExpenseRow>(`SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE ${LIVE} AND id = ?`, id);
    if (!row) return;
    found = toExpense(row);
    await db.runAsync(`DELETE FROM expenses WHERE id = ?`, id);
  });
  return found;
}

/** Undo: puts a deleted expense back. */
export async function restoreExpense(db: SqlDb, e: Expense, now: number): Promise<void> {
  checkExpense(e);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO expenses (id, amount, currency, category_id, day, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      e.id,
      e.amount,
      e.currency,
      e.categoryId,
      e.day,
      e.note,
      e.createdAt,
      now,
    );
  });
}

/** Development only (stress data): replaces every expense, in batches of 100 rows per INSERT. */
export async function replaceAllExpenses(db: SqlDb, expenses: Expense[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM expenses`);
    for (let i = 0; i < expenses.length; i += 100) {
      const batch = expenses.slice(i, i + 100);
      await db.runAsync(
        `INSERT INTO expenses (id, amount, currency, category_id, day, note, created_at, updated_at) VALUES ${batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`,
        batch.flatMap((e) => [e.id, e.amount, e.currency, e.categoryId, e.day, e.note, e.createdAt, e.updatedAt]),
      );
    }
  });
}

/** Account deletion: every row of every table. */
export async function wipeAll(db: SqlDb): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of ['expenses', 'categories', 'settings', 'outbox']) await db.runAsync(`DELETE FROM ${table}`);
  });
}
