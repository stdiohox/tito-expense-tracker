/*
 * expo-sqlite for Jest. The real module needs a phone (or a browser with a worker); here Node's own
 * SQLite (node:sqlite, built into Node 24) runs the same SQL, so tests exercise the real schema,
 * migrations and queries rather than a fake.
 *
 * Databases live in memory, one per name, and survive "closing": opening the same name again
 * returns the same data, which is how the tests restart the app. `__resetDatabases()` empties them
 * all (jest.setup.js does it before each test), and `__failNextOpen()` makes the next open fail,
 * for the error screen.
 */
// process.getBuiltinModule bypasses Jest's module registry, which doesn't know node:sqlite. (Node
// prints "SQLite is an experimental feature" once per test worker; it is harmless.)
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

const files = new Map();
let failNext = null;

/** expo-sqlite accepts (sql, a, b) or (sql, [a, b]); node:sqlite wants (a, b), with no booleans or undefined. */
function params(rest) {
  const list = rest.length === 1 && Array.isArray(rest[0]) ? rest[0] : rest;
  return list.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v));
}
// node:sqlite rows have no prototype; expo-sqlite's are plain objects. Only single rows are copied
// (cheap); lists are returned as they come, so timings in npm run perf aren't inflated by copying.
const plain = (row) => (row ? { ...row } : null);

function wrap(raw, name) {
  let depth = 0;
  const db = {
    databasePath: name,
    execSync: (sql) => raw.exec(sql),
    runSync: (sql, ...rest) => {
      const r = raw.prepare(sql).run(...params(rest));
      return { changes: Number(r.changes), lastInsertRowId: Number(r.lastInsertRowid) };
    },
    getAllSync: (sql, ...rest) => raw.prepare(sql).all(...params(rest)),
    getFirstSync: (sql, ...rest) => plain(raw.prepare(sql).get(...params(rest))),
    execAsync: async (sql) => db.execSync(sql),
    runAsync: async (sql, ...rest) => db.runSync(sql, ...rest),
    getAllAsync: async (sql, ...rest) => db.getAllSync(sql, ...rest),
    getFirstAsync: async (sql, ...rest) => db.getFirstSync(sql, ...rest),
    withTransactionSync: (task) => {
      raw.exec('BEGIN');
      try {
        task();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
    withTransactionAsync: async (task) => {
      // Like the real one: not exclusive, and a nested call joins the outer transaction.
      if (depth > 0) return task();
      depth += 1;
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      } finally {
        depth -= 1;
      }
    },
    closeAsync: async () => {},
    closeSync: () => {},
  };
  return db;
}

function open(name) {
  if (failNext) {
    const error = failNext;
    failNext = null;
    throw error;
  }
  if (!files.has(name)) files.set(name, new DatabaseSync(':memory:'));
  return wrap(files.get(name), name);
}

module.exports = {
  openDatabaseSync: (name) => open(name),
  openDatabaseAsync: async (name) => open(name),
  deleteDatabaseSync: (name) => files.delete(name),
  deleteDatabaseAsync: async (name) => {
    files.delete(name);
  },
  __resetDatabases: () => {
    // Forgotten, not closed: a test file that opened one in beforeAll keeps using it.
    files.clear();
    failNext = null;
  },
  __failNextOpen: (error = new Error('disk I/O error')) => {
    failNext = error;
  },
};
