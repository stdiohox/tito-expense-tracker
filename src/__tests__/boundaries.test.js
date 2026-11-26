/*
 * docs/ARCHITECTURE.md §3, rule 2: screens and components never touch storage. They read and
 * write through the hooks in src/data, which is what lets the storage change underneath them.
 * (Plain JavaScript: it reads files with Node's fs, and the app's TypeScript has no Node types.)
 */
/* global __dirname */
const { describe, expect, it } = require('@jest/globals');
const { readdirSync, readFileSync, statSync } = require('fs');
const { join, relative } = require('path');

const ROOT = join(__dirname, '..', '..');

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
  });
}

const importing = (list, pattern) => list.filter((f) => pattern.test(readFileSync(f, 'utf8'))).map((f) => relative(ROOT, f));

describe('layer boundaries', () => {
  it('no screen or component imports the database', () => {
    const list = [...files(join(ROOT, 'src', 'app')), ...files(join(ROOT, 'src', 'components'))];
    expect(importing(list, /from ['"](@\/db(\/[^'"]*)?|\.\.?\/[^'"]*\/db\/[^'"]*|expo-sqlite(\/[^'"]*)?)['"]/)).toEqual([]);
  });

  it('the domain layer stays pure: no React, React Native, Expo or storage', () => {
    const list = files(join(ROOT, 'src', 'domain')).filter((f) => !f.includes('__tests__'));
    expect(importing(list, /from ['"](react|react-native|expo[^'"]*|@\/(db|data|components|app)[^'"]*)['"]/)).toEqual([]);
  });
});
