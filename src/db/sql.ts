import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * The part of expo-sqlite's database the app uses. Everything in src/db takes this instead of the
 * concrete class, so the same code runs on the phone, on the web and in Jest (where a Node SQLite
 * stands in for it: jest.sqlite.js).
 *
 * Writes are async (they run off the JavaScript thread on phones). Reads used while rendering are
 * the *Sync forms: indexed queries that take well under a millisecond, so screens can render from
 * SQLite directly without a loading flash.
 */
export type SqlDb = Pick<
  SQLiteDatabase,
  | 'execAsync'
  | 'runAsync'
  | 'getAllAsync'
  | 'getFirstAsync'
  | 'getAllSync'
  | 'getFirstSync'
  | 'withTransactionAsync'
  | 'closeAsync'
>;
