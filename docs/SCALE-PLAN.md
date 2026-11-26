# TET scale and reliability plan

For 10,000 to 200,000 users. Builds on [ARCHITECTURE.md §10](./ARCHITECTURE.md#10-phase-2-target-architecture) (Phase 2 target architecture). Plain language; each section says what we do and why.

**Target:** 99.5% or more of sessions crash-free (Sentry's "crash-free sessions"), and 99.9% or more of users crash-free in a normal week. A release that drops below 99.5% is paused and fixed before it reaches more people.

## 1. Client stability (the app never shows a white screen)

- **Error boundary on every route.** A crash in one screen shows a calm "Something went wrong" screen with Try again and Go home, never a blank page. (Step 2 of the reliability pass.)
- **Small boundaries around risky parts:** charts, onboarding animations and currency formatting. If one fails, only that part is replaced by a quiet fallback; the rest of the screen keeps working.
- **Unhandled promise rejections are caught and logged**, and sent to crash reporting once it is connected.
- **Defensive data:** every currency lookup goes through `currencyInfo()`, so an unknown or old currency code never crashes. Rows read from storage are validated before use (`toDayKey`, `toMonthKey`).
- **No work in render that grows with data:** summaries are memoised per month and currency; long lists are virtualised (FlashList).
- **Force update:** a minimum supported version checked on launch (ARCHITECTURE.md §10.7), so a broken old build can be retired.

## 2. Data and sync (Phase 2: SQLite + outbox + Supabase)

- **SQLite on the phone is the only thing screens read.** Logging works offline and never waits for the network.
- **Outbox:** every write goes to SQLite and the outbox in one transaction. Sync pushes the outbox, then pulls changes since a cursor.
- **Idempotent:** expense ids are made on the phone, so a retry never creates a duplicate. Edits carry a version; a delete always wins.
- **The server owns time:** a server-side `revision` number orders changes, so a phone with a wrong clock can't skip or overwrite rows.
- **Small, batched sync:** push at most 200 changes per call; pull in pages of 500; back off on errors (1 s, 2 s, 4 s … up to 5 minutes, with jitter) so 200,000 phones never retry at the same moment.
- **Totals in SQL** (by month, category, day and currency) with an index on `day`; JavaScript `summarise()` stays as the reference and a test checks both agree.
- **One local database per user**, wiped only after a server account deletion succeeds.

## 3. Supabase at 200,000 users

**Security**
- Row Level Security on every table: `user_id = auth.uid()` for read and write. A two-account test before launch proves account A can't see account B.
- The service role key lives only in Edge Functions, never in the app.
- `currency` columns check against the supported list; amounts are `bigint` minor units with a sane upper bound.

**Indexes**
- `expenses (user_id, revision)` for sync pulls.
- `expenses (user_id, day) where deleted_at is null` for month views.
- `categories (user_id, revision)`; `profiles (id)` is the primary key.
- Check with `explain analyze` on a copy loaded with test data (200,000 users × 1,000 expenses) before launch.

**Rate limits and abuse**
- Supabase Auth rate limits on sign-up, sign-in and password reset (keep the defaults, lower password reset to a few per hour per email).
- The push RPC rejects batches over 200 rows and payloads over 256 KB.
- Edge Functions check the JWT and are idempotent.

**Backups**
- Daily backups (included on Pro). Add Point-in-Time Recovery before launch so we can restore to any minute in the last 7 days.
- A restore drill once a quarter on the staging project.

**Plan and estimated monthly cost** (estimates; check supabase.com/pricing before buying, prices change)

| Users (monthly active) | Plan | Rough monthly cost |
|---|---|---|
| Up to 10,000 | Pro | about $25 + small compute ≈ $40 |
| 50,000 | Pro, small/medium compute | about $60–$110 |
| 100,000 | Pro, medium compute, PITR | about $150–$250 |
| 200,000 | Pro, large compute, PITR; auth over 100k MAU billed per user | about $500–$800 |

Rough sizing: 200,000 active users logging about 2 expenses a day is about 12 million rows a month, about 5 GB a month with indexes. Archive or partition by year after the second year. Sentry (Team plan, about $26+ a month) and EAS (Production plan, about $99 a month) are extra.

## 4. Testing

- **Unit tests** (Jest + jest-expo) for money in all 20 currencies, dates in Africa/Lagos, summaries, budgets and pace.
- **Component tests** (React Native Testing Library) for the key flows: sign up → setup → Home; add, edit, delete and undo; currency toggle; a budget at ₦0.
- **Domain check script** (`npm run check:dates`) and **contrast check** (`npm run check:contrast`) keep running.
- **Phase 2:** sync tests (offline add 5, kill, reconnect → exactly 5), a SQL-vs-JavaScript totals test, and the two-account RLS test.
- **Real devices** before each store release: the checklist in `tasks/todo.md`.

## 5. Release process

1. Every pull request runs CI: typecheck, lint, checks, tests and a web build. `main` only accepts green pull requests.
2. Builds go through EAS: `preview` to TestFlight and Play internal testing (against a staging Supabase project), then `production`.
3. **Staged rollout:** Play 5% → 20% → 50% → 100%, and iOS phased release over 7 days. Stop if crash-free sessions fall under 99.5%.
4. **Over-the-air updates** (EAS Update) for fixes only, on a `runtimeVersion` policy, first to a 10% channel, then everyone. Roll back with one command if crashes rise.
5. Every release has a short changelog and a named owner on call for 48 hours.

## 6. Monitoring

- **Sentry** for crashes and errors, release health (crash-free sessions per version) and slow screens. Alerts: a new issue affecting more than 50 users, or crash-free sessions under 99.5% for an hour.
- **Supabase dashboard:** database CPU and memory, slow queries, auth errors, Edge Function errors. Alert at 70% CPU for 15 minutes.
- **Store consoles:** Android vitals (ANR and crash rate under the bad-behaviour thresholds), App Store crash reports.
- **Weekly review:** top 5 crashes, slowest screens, sync failure rate.

## 7. How to connect Sentry

Sentry is installed (`@sentry/react-native`) but **off** until you give it a DSN. Without one, Sentry is never loaded and the app runs exactly as before.

**What it sends:** crashes, errors caught by the screen error boundaries and the small part boundaries, and release health (crash-free sessions). **What it never sends:** amounts, notes, names or emails. `src/lib/crash-reporting.ts` turns off default personal data, screenshots and the view hierarchy (it contains on-screen amounts), keeps only navigation breadcrumbs, and scrubs every event: user, request and extra data are removed, and every number and email in error messages is replaced (`₦4,500` becomes `₦#`).

**To switch it on:**
1. Create a free account at sentry.io and a **React Native** project (one project for iOS, Android and web).
2. Copy the project's DSN (Settings → Projects → your project → Client Keys (DSN)).
3. For local development, create `.env.local` in the project root (it is gitignored):
   ```
   EXPO_PUBLIC_SENTRY_DSN=https://…@….ingest.sentry.io/…
   ```
   Restart `npx expo start`. In Expo Go only JavaScript errors are reported; a development build also reports native crashes.
4. For EAS builds, add the same variable to the EAS environment (`eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value … --environment production --visibility plaintext`), or in the Expo dashboard.
5. **Readable stack traces (source maps):** create an Organization Auth Token at sentry.io/settings/auth-tokens and add it to EAS as `SENTRY_AUTH_TOKEN` with **sensitive** visibility. Add your org and project names, either as `SENTRY_ORG` and `SENTRY_PROJECT` in EAS, or in `app.json`: `["@sentry/react-native", { "organization": "…", "project": "…" }]`. EAS Build then uploads source maps automatically. After `eas update`, run `npx sentry-expo-upload-sourcemaps dist`.
6. In Sentry, set the alerts in §6: a new issue affecting more than 50 users, and crash-free sessions under 99.5% for an hour.

To test: with a DSN set, temporarily throw an error in a screen in a development build, open that screen, and check the issue appears in Sentry with no amounts in it.

## 8. Performance at scale

Filled in by step 5 of the reliability pass.
