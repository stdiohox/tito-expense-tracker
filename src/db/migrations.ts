import type { SqlDb } from './sql';

/*
 * Versioned schema migrations. The database's version lives in SQLite's own header
 * (`PRAGMA user_version`). On every launch `migrate()` runs, in order, each migration newer than
 * that version, each in its own transaction together with the version bump: a migration either
 * lands completely or not at all, and a crash halfway leaves the old schema and the old data.
 *
 * Rules, so a schema change never loses data:
 * 1. Append only. Never edit or reorder a migration that has shipped; add a new one.
 * 2. Additive first: `ALTER TABLE … ADD COLUMN` with a default, new tables, new indexes.
 * 3. To reshape a table (rename or drop a column, change a constraint): create the new table, copy
 *    every row across with INSERT … SELECT, then drop the old one and rename, all in the one
 *    migration (one transaction).
 * 4. Never delete user rows in a migration.
 *
 * Every table carries id, user_id (null until accounts sync in part B), created_at, updated_at
 * and deleted_at (a soft delete: the row stays as a tombstone so a later sync can pass the delete
 * on). Times are epoch milliseconds; money is integer minor units; `day` is the local calendar day
 * "YYYY-MM-DD", so comparing it as text compares dates.
 */

export type Migration = { version: number; name: string; sql: string };

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: 'expenses, categories, settings and the outbox',
    sql: `
      CREATE TABLE expenses (
        id          TEXT PRIMARY KEY NOT NULL,
        user_id     TEXT,
        amount      INTEGER NOT NULL CHECK (amount > 0),
        currency    TEXT NOT NULL,
        category_id TEXT NOT NULL,
        day         TEXT NOT NULL,
        note        TEXT NOT NULL DEFAULT '',
        version     INTEGER NOT NULL DEFAULT 1,
        created_at  INTEGER NOT NULL,
        updated_at  INTEGER NOT NULL,
        deleted_at  INTEGER
      );
      CREATE INDEX expenses_day ON expenses (day);
      CREATE INDEX expenses_category ON expenses (category_id);
      CREATE INDEX expenses_currency ON expenses (currency);

      CREATE TABLE categories (
        id              TEXT PRIMARY KEY NOT NULL,
        user_id         TEXT,
        name            TEXT NOT NULL,
        icon            TEXT NOT NULL,
        budget          INTEGER,
        budget_currency TEXT,
        built_in        INTEGER NOT NULL DEFAULT 0,
        hidden          INTEGER NOT NULL DEFAULT 0,
        position        INTEGER NOT NULL DEFAULT 0,
        version         INTEGER NOT NULL DEFAULT 1,
        created_at      INTEGER NOT NULL,
        updated_at      INTEGER NOT NULL,
        deleted_at      INTEGER
      );

      -- One row per setting; id is the setting's name and value is JSON.
      CREATE TABLE settings (
        id         TEXT PRIMARY KEY NOT NULL,
        user_id    TEXT,
        value      TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted_at INTEGER
      );

      -- Local changes waiting to be sent to the server (part B). Written in the same transaction as
      -- the change itself; nothing reads it yet.
      CREATE TABLE outbox (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      TEXT,
        entity       TEXT NOT NULL,
        entity_id    TEXT NOT NULL,
        op           TEXT NOT NULL,
        payload      TEXT NOT NULL,
        base_version INTEGER,
        created_at   INTEGER NOT NULL,
        updated_at   INTEGER NOT NULL,
        deleted_at   INTEGER
      );
    `,
  },
  {
    version: 2,
    name: 'index expenses by currency and day',
    // Most screens ask for one currency in one month. With only single-column indexes SQLite
    // picked expenses_currency, which in the main currency is most of the table; this one goes
    // straight to the month's rows in that currency.
    sql: `CREATE INDEX expenses_currency_day ON expenses (currency, day);`,
  },
];

export const LATEST_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

/** The schema version stored in the database file (0 for a new, empty file). */
export async function schemaVersion(db: SqlDb): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

/**
 * Brings the database up to the newest version. Returns the version it ends on.
 * A database from a newer app (after a downgrade) is left untouched and reported as an error, so
 * this build never writes into a schema it doesn't understand.
 */
export async function migrate(db: SqlDb, migrations: readonly Migration[] = MIGRATIONS): Promise<number> {
  const latest = migrations.length ? migrations[migrations.length - 1].version : 0;
  let current = await schemaVersion(db);
  if (current > latest) {
    throw new Error(`The saved data is from a newer version of the app (schema ${current}; this build knows ${latest}).`);
  }
  for (const m of migrations) {
    if (m.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(m.sql);
      // Inside the transaction: the version moves only if the whole migration landed.
      await db.execAsync(`PRAGMA user_version = ${Math.trunc(m.version)}`);
    });
    current = m.version;
  }
  return current;
}
