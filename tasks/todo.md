# Build plan: Tito Expense Tracker

Source of truth for scope: `proposals/tito-expense-app/PLAN.md` in the Koret Tech repo
(Track B: own Supabase backend, decided 2026-11-09). This file tracks the build.

## Phase 1: screens on sample data (for Mr Tito's approval)

- [x] Scaffold Expo SDK 58 app (TypeScript, Expo Router), npm
- [x] Theme: light + dark tokens, type scale, spacing, icons (Tabler), fonts (Manrope, Fraunces)
- [x] Domain: money in kobo/cents integers, per-expense currency, local-time months (fixes web bugs B1–B3)
- [x] Data: repository interface + in-memory sample data (SQLite + outbox in phase 2)
- [x] Screens:
  - [x] Home: month total, pace line vs last month, spending by category
  - [x] Add / edit expense (sheet)
  - [x] Category detail: total, budget, expenses
  - [x] All expenses: grouped by day, search, delete with undo
  - [x] Reports: month by category, share as PDF (UI only in phase 1)
  - [x] Settings: currency, reminder, export, sign out, delete account
  - [x] Welcome, sign up, sign in, reset password (UI only)
- [x] Verify: typecheck, lint, expo-doctor, date + contrast checks, web build at 390×844 light + dark, add/delete/undo flow
- [ ] Verify on real phones with Expo Go (needs Samuel / Mr Tito; no simulator on this Mac)
- [x] Reviews: typescript-reviewer, react-reviewer, a11y-architect, impeccable finish review (fix batch applied 2026-11-10)

## Phase 2: real data
- [ ] expo-sqlite store + outbox, Supabase schema + RLS, auth, sync, account deletion
- [ ] Store API becomes async (mutators return promises; toast/navigate after the write; `ready`/`error` state gates screens)
- [ ] Soft deletes with tombstones; Undo restores with a newer `updatedAt` so sync can't revert it
- [ ] Aggregates (month totals, by category, by day) in SQL with an index on `day`, not in JS over all rows
- [ ] Parse DB/CSV rows through validating `toDayKey`/`toMonthKey` constructors (branded types)
- [ ] Delete account calls the Edge Function, with an error path; sign-in/up get real error states

## Check on real devices (no simulator on this Mac)
- [ ] iOS: Home header runs under the status bar; tab content insets; FAB and toast clear the tab bar
- [ ] Android: keyboard does not cover Save in the form sheets (edge-to-edge); FAB offset above the nav bar
- [ ] VoiceOver / TalkBack: radios, adjustable date, error announcements, Undo reachable
- [ ] Large text (200%): rows, category grid, totals

## Later phases
See PLAN.md §11 (notifications, PDF, store prep, launch).

## Decisions taken in this repo
- Charts are drawn with react-native-svg, not Victory Native/Skia: two simple charts, and Skia
  needs extra WebAssembly setup for the web build.
- JetBrains Mono from the web tracker is dropped; amounts use Manrope's tabular figures.
