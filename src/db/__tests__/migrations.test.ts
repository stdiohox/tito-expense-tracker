import { describe, expect, it } from '@jest/globals';
import { openDatabaseAsync } from 'expo-sqlite';

import { LATEST_VERSION, MIGRATIONS, migrate, schemaVersion, type Migration } from '../migrations';
import { openDatabase } from '../open';
import type { SqlDb } from '../sql';

const columns = async (db: SqlDb, table: string) =>
  (await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`)).map((c) => c.name);

describe('migrations', () => {
  it('creates every table with id, user_id and the three timestamps', async () => {
    const db = await openDatabase('m1.db');
    expect(await schemaVersion(db)).toBe(LATEST_VERSION);
    for (const table of ['expenses', 'categories', 'settings', 'outbox']) {
      expect(await columns(db, table)).toEqual(expect.arrayContaining(['id', 'user_id', 'created_at', 'updated_at', 'deleted_at']));
    }
  });

  it('indexes expenses by day, category and currency', async () => {
    const db = await openDatabase('m2.db');
    const indexes = await db.getAllAsync<{ name: string }>(`PRAGMA index_list(expenses)`);
    expect(indexes.map((i) => i.name)).toEqual(expect.arrayContaining(['expenses_day', 'expenses_category', 'expenses_currency']));
    const plan = await db.getAllAsync<{ detail: string }>(`EXPLAIN QUERY PLAN SELECT * FROM expenses WHERE day >= '2026-11-00' AND day <= '2026-11-99'`);
    expect(plan.map((p) => p.detail).join(' ')).toMatch(/expenses_day/);
  });

  it('runs again without changing anything', async () => {
    const db = await openDatabase('m3.db');
    await db.runAsync(`INSERT INTO settings (id, value, created_at, updated_at) VALUES ('x', '1', 1, 1)`);
    expect(await migrate(db)).toBe(LATEST_VERSION);
    expect(await db.getFirstAsync(`SELECT value FROM settings WHERE id = 'x'`)).toEqual({ value: '1' });
  });

  it('keeps existing rows when a later migration is added', async () => {
    const db = await openDatabase('m4.db');
    await db.runAsync(
      `INSERT INTO expenses (id, amount, currency, category_id, day, note, created_at, updated_at) VALUES ('e1', 250000, 'NGN', 'food', '2026-11-03', 'Lunch', 1, 1)`,
    );
    const next: Migration = { version: LATEST_VERSION + 1, name: 'test: add a column', sql: `ALTER TABLE expenses ADD COLUMN receipt TEXT` };
    expect(await migrate(db, [...MIGRATIONS, next])).toBe(LATEST_VERSION + 1);
    expect(await db.getFirstAsync(`SELECT id, amount, note, receipt FROM expenses`)).toEqual({ id: 'e1', amount: 250000, note: 'Lunch', receipt: null });
  });

  it('rolls a failed migration back completely, data and version', async () => {
    const db = await openDatabase('m5.db');
    await db.runAsync(`INSERT INTO settings (id, value, created_at, updated_at) VALUES ('x', '1', 1, 1)`);
    const broken: Migration = {
      version: LATEST_VERSION + 1,
      name: 'test: fails halfway',
      sql: `CREATE TABLE extra (id TEXT); DELETE FROM settings; INSERT INTO nowhere VALUES (1);`,
    };
    await expect(migrate(db, [...MIGRATIONS, broken])).rejects.toThrow();
    expect(await schemaVersion(db)).toBe(LATEST_VERSION);
    expect(await db.getFirstAsync(`SELECT value FROM settings WHERE id = 'x'`)).toEqual({ value: '1' });
    expect(await db.getFirstAsync(`SELECT name FROM sqlite_master WHERE name = 'extra'`)).toBeNull();
  });

  it('refuses a database from a newer app instead of writing into it', async () => {
    const raw = await openDatabaseAsync('m6.db');
    await raw.execAsync(`PRAGMA user_version = ${LATEST_VERSION + 5}`);
    await expect(openDatabase('m6.db')).rejects.toThrow(/newer version/);
  });

  it('upgrades a version-1 database to the latest without touching its rows', async () => {
    const raw = await openDatabaseAsync('m8.db');
    expect(await migrate(raw, MIGRATIONS.slice(0, 1))).toBe(1);
    await raw.runAsync(
      `INSERT INTO expenses (id, amount, currency, category_id, day, note, created_at, updated_at) VALUES ('e1', 1500, 'USD', 'transport', '2026-10-31', '', 5, 6)`,
    );
    const db = await openDatabase('m8.db');
    expect(await schemaVersion(db)).toBe(LATEST_VERSION);
    expect(await db.getAllAsync(`SELECT id, amount, currency, day, created_at, updated_at FROM expenses`)).toEqual([
      { id: 'e1', amount: 1500, currency: 'USD', day: '2026-10-31', created_at: 5, updated_at: 6 },
    ]);
    const indexes = await db.getAllAsync<{ name: string }>(`PRAGMA index_list(expenses)`);
    expect(indexes.map((i) => i.name)).toContain('expenses_currency_day');
  });

  it('versions are 1, 2, 3 … with no gaps, so none is skipped', () => {
    expect(MIGRATIONS.map((m) => m.version)).toEqual(MIGRATIONS.map((_, i) => i + 1));
  });

  it('upgrades a brand-new file from version 0', async () => {
    const raw = await openDatabaseAsync('m7.db');
    expect(await schemaVersion(raw)).toBe(0);
    expect(await migrate(raw)).toBe(LATEST_VERSION);
  });
});
