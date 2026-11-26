import { toDayKey } from '@/domain/dates';
import { isKnownCurrency } from '@/domain/money';
import type { SpendGroup } from '@/domain/summary';
import type { CurrencyCode, Expense, MonthKey } from '@/domain/types';

import type { SqlDb } from './sql';

/*
 * Every read and write of the app's data, as plain functions over a database. Only src/data calls
 * these; screens go through the hooks there.
 *
 * Reads are synchronous (indexed, small results) so screens render straight from SQLite.
 * Writes are async; each runs in a transaction.
 */

/**
 * The columns of an Expense, named as the app names them, so each row SQLite returns already is an
 * Expense: no second object per row (a month can be hundreds of rows). Values were checked on the
 * way in (checkExpense).
 */
type ExpenseRow = Expense;
const EXPENSE_COLUMNS = 'id, amount, currency, category_id AS categoryId, day, note, created_at AS createdAt, updated_at AS updatedAt';
/** Rows that are not deleted. */
const LIVE = 'deleted_at IS NULL';

const toExpense = (r: ExpenseRow): Expense => r;

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
// Totals, added up in SQL (indexed on day), never by scanning every expense in JavaScript
// ---------------------------------------------------------------------------------------------

/**
 * A month's spending added up by currency, category and day: at most currencies × categories ×
 * days rows however many expenses there are. summariseGroups() turns these into a MonthSummary.
 */
export function monthGroups(db: SqlDb, month: MonthKey): SpendGroup[] {
  const [from, to] = monthBounds(month);
  return db.getAllSync<SpendGroup>(
    `SELECT currency, category_id AS categoryId, day, SUM(amount) AS total, COUNT(*) AS count
       FROM expenses WHERE ${LIVE} AND day BETWEEN ? AND ?
      GROUP BY currency, category_id, day`,
    from,
    to,
  );
}

/** Each month's total in one currency, for the months given (missing months are 0). */
export function monthTotals(db: SqlDb, months: readonly MonthKey[], currency: CurrencyCode): { month: MonthKey; total: number }[] {
  if (months.length === 0) return [];
  const sorted = [...months].sort();
  const rows = db.getAllSync<{ month: MonthKey; total: number }>(
    `SELECT substr(day, 1, 7) AS month, SUM(amount) AS total
       FROM expenses WHERE ${LIVE} AND currency = ? AND day BETWEEN ? AND ?
      GROUP BY month`,
    currency,
    monthBounds(sorted[0])[0],
    monthBounds(sorted[sorted.length - 1])[1],
  );
  const byMonth = new Map(rows.map((r) => [r.month, r.total]));
  return months.map((m) => ({ month: m, total: byMonth.get(m) ?? 0 }));
}

/** One category's total in one currency and month. */
export function categoryTotal(db: SqlDb, categoryId: string, currency: CurrencyCode, month: MonthKey): number {
  const [from, to] = monthBounds(month);
  return (
    db.getFirstSync<{ total: number | null }>(
      `SELECT SUM(amount) AS total FROM expenses WHERE ${LIVE} AND category_id = ? AND currency = ? AND day BETWEEN ? AND ?`,
      categoryId,
      currency,
      from,
      to,
    )?.total ?? 0
  );
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
    await outboxExpense(db, e.id, 'create', null, e.updatedAt);
  });
}

/** Saves an edit. False when the expense no longer exists (deleted meanwhile): a delete wins. */
export async function updateExpense(db: SqlDb, e: Expense): Promise<boolean> {
  checkExpense(e);
  let changed = false;
  await db.withTransactionAsync(async () => {
    const before = await db.getFirstAsync<{ version: number }>(`SELECT version FROM expenses WHERE id = ? AND ${LIVE}`, e.id);
    if (!before) return;
    await db.runAsync(
      `UPDATE expenses SET amount = ?, currency = ?, category_id = ?, day = ?, note = ?, updated_at = ?, version = version + 1 WHERE id = ?`,
      e.amount,
      e.currency,
      e.categoryId,
      e.day,
      e.note,
      e.updatedAt,
      e.id,
    );
    await outboxExpense(db, e.id, 'update', before.version, e.updatedAt);
    changed = true;
  });
  return changed;
}

/**
 * Soft delete: the row stays as a tombstone (deleted_at set) so a later sync can pass the delete
 * on. Returns the expense as it was (for Undo), or undefined when it was already gone.
 */
export async function deleteExpense(db: SqlDb, id: string, now: number): Promise<Expense | undefined> {
  let found: Expense | undefined;
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<ExpenseRow & { version: number }>(
      `SELECT ${EXPENSE_COLUMNS}, version FROM expenses WHERE ${LIVE} AND id = ?`,
      id,
    );
    if (!row) return;
    const { version: _version, ...expense } = row;
    found = toExpense(expense);
    await db.runAsync(`UPDATE expenses SET deleted_at = ?, updated_at = ?, version = version + 1 WHERE id = ?`, now, now, id);
    await outboxExpense(db, id, 'delete', row.version, now);
  });
  return found;
}

/**
 * Undo a delete: clears deleted_at with an updated_at newer than the delete (and a new version),
 * so a sync can't bring the delete back. Does nothing if the expense isn't deleted.
 */
export async function restoreExpense(db: SqlDb, id: string, now: number): Promise<boolean> {
  let restored = false;
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{ version: number; deleted_at: number; updated_at: number }>(
      `SELECT version, deleted_at, updated_at FROM expenses WHERE id = ? AND deleted_at IS NOT NULL`,
      id,
    );
    if (!row) return;
    // Strictly newer than the delete even if the clock hasn't moved on (or went back).
    const at = Math.max(now, row.deleted_at + 1, row.updated_at + 1);
    await db.runAsync(`UPDATE expenses SET deleted_at = NULL, updated_at = ?, version = version + 1 WHERE id = ?`, at, id);
    await outboxExpense(db, id, 'restore', row.version, at);
    restored = true;
  });
  return restored;
}

// ---------------------------------------------------------------------------------------------
// Outbox: local changes waiting to be sent (part B sends them; nothing reads them yet)
// ---------------------------------------------------------------------------------------------

export type OutboxOp = 'create' | 'update' | 'delete' | 'restore';
export type OutboxRow = {
  id: number;
  entity: string;
  entity_id: string;
  op: OutboxOp;
  payload: string;
  base_version: number | null;
  created_at: number;
};

/** Appends a change to the outbox. Called inside the change's own transaction. */
export async function enqueueChange(
  db: SqlDb,
  entity: 'expense' | 'category' | 'setting',
  entityId: string,
  op: OutboxOp,
  payload: unknown,
  baseVersion: number | null,
  now: number,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO outbox (entity, entity_id, op, payload, base_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    entity,
    entityId,
    op,
    JSON.stringify(payload),
    baseVersion,
    now,
    now,
  );
}

/** The outbox entry for an expense carries the whole row as it is after the change. */
async function outboxExpense(db: SqlDb, id: string, op: OutboxOp, baseVersion: number | null, now: number): Promise<void> {
  const row = await db.getFirstAsync(
    `SELECT id, amount, currency, category_id, day, note, version, created_at, updated_at, deleted_at FROM expenses WHERE id = ?`,
    id,
  );
  await enqueueChange(db, 'expense', id, op, row, baseVersion, now);
}

/** Changes not yet sent, oldest first. */
export function pendingChanges(db: SqlDb): OutboxRow[] {
  return db.getAllSync<OutboxRow>(
    `SELECT id, entity, entity_id, op, payload, base_version, created_at FROM outbox WHERE deleted_at IS NULL ORDER BY id`,
  );
}

/** Development only (stress data): replaces every expense, in batches of 100 rows per INSERT. No outbox rows: test data never syncs. */
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
