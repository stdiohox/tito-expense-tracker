import { openDatabaseAsync } from 'expo-sqlite';
import { Platform } from 'react-native';

import { migrate } from './migrations';
import type { SqlDb } from './sql';

/** The one database file on the device. Part B makes this one file per signed-in user. */
export const DATABASE_NAME = 'tet.db';

/**
 * Opens the database and brings its schema up to date. Throws if either fails; the store turns
 * that into the calm "couldn't open your data" screen with Try again.
 */
export async function openDatabase(name: string = DATABASE_NAME): Promise<SqlDb> {
  const db = await openDatabaseAsync(name);
  try {
    // Write-ahead logging: reads don't wait for writes. The web build's storage doesn't support it.
    if (Platform.OS !== 'web') await db.execAsync('PRAGMA journal_mode = WAL');
    await migrate(db);
    return db;
  } catch (error) {
    await db.closeAsync().catch(() => {});
    throw error;
  }
}
