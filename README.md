# TET · Tito Finance Expense Tracker

A phone app (iOS and Android) for logging what you spend in seconds and seeing your month at a glance.
Built by Koret for **Tito Finance**. It replaces the web tracker at `expenses.titofinance.com`.

> **Status: phase 2 part A, saved on the device.** Every screen works and there is no demo data:
> the app starts empty and everything in it is what you enter. Expenses, categories, budgets and
> settings are saved in SQLite on the phone (expo-sqlite), so they survive closing and reopening
> the app. There are no real accounts, no sync and no backend yet: part B adds a Supabase backend
> owned by Koret, and sends the outbox of changes the app already records.

| | |
|---|---|
| **Repo** | `stdiohox/tito-expense-tracker` (default branch `main`) |
| **Stack** | Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript 6 · Expo Router 58 |
| **Package manager** | **npm** (`package-lock.json`). Do not use bun, yarn or pnpm here. |
| **Targets** | iOS and Android from one codebase, plus a web build of the same code for previews |
| **Backend** | None in phase 1. Phase 2: a new Supabase project (Postgres, Auth, Row-Level Security) |
| **Deploy** | Not set up yet. Planned: EAS Build and Submit to the App Store and Google Play |

## Contents

- [What the app does](#what-the-app-does)
- [Quick start](#quick-start)
- [Scripts and checks](#scripts-and-checks)
- [Project structure](#project-structure)
- [Screens and routes](#screens-and-routes)
- [Rules that matter](#rules-that-matter)
- [How to make common changes](#how-to-make-common-changes)
- [Testing on devices](#testing-on-devices)
- [What is stubbed in phase 1](#what-is-stubbed-in-phase-1)
- [Roadmap](#roadmap)
- [Documentation map](#documentation-map)

---

## What the app does

- **Log a payment fast.** The raised **+** in the middle of the dock opens Add expense from any tab (Quick add on Home presets a category). The sheet opens with
  the keyboard on the amount. Pick a category, optionally change the date or add a note, and save.
- **See the month at a glance.** Home shows:
  - the month's total;
  - a *pace line* comparing this month with last month up to the same day;
  - where the money went, by category.
- **Edit and delete.** Any expense can be edited. Deleting shows a snackbar with **Undo**.
- **Browse and search.** The Expenses tab groups the month by day, with daily totals and a search
  over notes and category names.
- **Reports.** The Reports tab shows:
  - the month total and a comparison with last month;
  - a ranked list by category;
  - a bar chart of up to six months (tap a bar to jump to that month).
- **Categories and budgets.** The twelve starter categories come from the web tracker, and users can
  add their own. Any category can have a monthly budget. Budgets inform and never alarm: going over
  shows in burgundy with words, never in red.
- **Twenty currencies, a main one and an optional second.** Picked from a list grouped by region
  and searchable by any country that uses the currency ("Germany" finds the euro, "Senegal" the
  West African CFA franc):
  - Africa: NGN, GHS, KES, ZAR, XAF, XOF, EGP, MAD, UGX, TZS
  - Europe: EUR, GBP
  - Americas: USD, CAD
  - Middle East and Asia: AED, SAR, INR, JPY, CNY
  - Oceania: AUD

  Each expense keeps the currency it was entered in, and each currency is tracked on its own: its
  own card on Home, and a toggle on Expenses and Reports. Nothing is ever converted.
- **Light and dark mode**, following the phone or forced in **Settings → Appearance**. Both are designed as a pair.
- **Onboarding.** Three intro slides, then a three-step setup after sign-up (main currency, how hands-on, categories and budgets); **Settings → Redo setup** reopens it.
- **Accessible.** The app has:
  - WCAG 2.2 AA contrast, checked by a script;
  - 44 pt / 48 dp touch targets;
  - support for system text sizes;
  - VoiceOver and TalkBack labels;
  - announced errors and toasts;
  - Reduce Motion support.

The account screens (welcome, sign up, sign in, password reset, delete account) are built as UI
only. They don't talk to a server yet. See [What is stubbed](#what-is-stubbed-in-phase-1).

---

## Quick start

### Prerequisites

- **Node.js 24** (built on 24.18). `npm run check:dates` runs TypeScript directly in Node, so it needs
  a Node version with built-in type stripping.
- **npm** (comes with Node).
- To try it on a phone: **Expo Go** from the App Store or Google Play.
- You don't need Xcode or Android Studio for phase 1.

### Install and run

```bash
git clone https://github.com/stdiohox/tito-expense-tracker.git
cd tito-expense-tracker
npm install

npx expo start          # dev server; scan the QR code with Expo Go (phone on the same Wi-Fi)
npx expo start --web    # browser preview; set the window to phone width (390 × 844)
```

The app opens **signed out, on the onboarding slides**, with no data. Create an account (any name,
email and an 8-character password; nothing is sent anywhere) to go through the setup steps, or use
"I already have an account" with any email and password. Everything you add is saved on the device
and is still there after you close and reopen the app (or reload the web page). **Settings → Sign
out** returns to the slides and keeps your data on the device; signing in again shows it.
**Delete account** wipes it all.

### Static web build

```bash
npx expo export -p web   # writes a single-page app to dist/ (git-ignored)
```

SQLite on the web runs in a worker that needs a **cross-origin-isolated** page, so whatever serves
`dist/` must send two headers on every response:

```
Cross-Origin-Embedder-Policy: credentialless
Cross-Origin-Opener-Policy: same-origin
```

They are already set for the dev server (`metro.config.js`), for Netlify and Cloudflare Pages
(`public/_headers`), for `npx serve dist` (`public/serve.json`) and for EAS Hosting (the
`expo-router` plugin in `app.json`). Without them the app shows "Your expenses didn't open" with
Try again, instead of a blank page.

---

## Scripts and checks

| Command | What it does |
|---|---|
| `npm start` | `expo start`: the dev server for Expo Go, a simulator or the web |
| `npm run ios` / `android` / `web` | Starts the dev server and opens that target |
| `npm run typecheck` | `tsc --noEmit` in strict mode |
| `npm run lint` | `expo lint` (ESLint 9 flat config, `eslint-config-expo`) |
| `npm run check:dates` | Date, money and summary assertions run with `TZ=Africa/Lagos`. Guards against the web tracker's bug B1 (month navigation broken in UTC+1) and bug B3 (yesterday's date just after midnight), and checks amount parsing and month summaries. |
| `npm run check:contrast` | Checks every text/background pair in `src/theme/tokens.ts` against WCAG AA, in light and dark. Exits non-zero on any failure. |
| `npm test` | Jest (jest-expo, React Native Testing Library), in `Africa/Lagos`: unit tests for money (all 20 currencies), dates, summaries, budgets and pace, flow tests that render the real app (sign up → setup → Home; add, edit, delete and undo; the currency toggle; a budget at ₦0; the error screens; closing and reopening the app keeps everything; setup resumes; sign out keeps data; delete account wipes it), and database tests (migrations, create/read/update, soft delete and Undo, outbox rows, and SQL totals matching `summarise()` in all 20 currencies). SQLite runs on Node's built-in copy (`jest.sqlite.js`). |
| `npm run perf` | Loads 10,000 expenses and times the work behind each screen (docs/SCALE-PLAN.md §8). Not part of `npm test`. |
| `npx expo-doctor` | Checks dependency versions and config against SDK 58 |

**Before you push**, run:

```bash
npm run typecheck && npm run lint && npm run check:dates && npm run check:contrast && npm test && npx expo-doctor
```

`scripts/check-dates.ts` also checks the pure functions in `src/domain/` with plain `node:assert`,
in plain Node; add domain cases there or in `src/domain/__tests__/`.

---

## Project structure

```
.
├── app.json                 Expo config: name, scheme "titoexpenses", icons, splash, typed routes, React Compiler
├── package.json             Scripts and dependencies (npm)
├── tsconfig.json            Strict TS; "@/…" → src/…
├── eslint.config.js         Expo flat config
├── AGENTS.md                Rules for AI coding agents (read the SDK 58 docs, use `npx expo install`)
├── PRODUCT.md               Product brief: users, purpose, principles, brand commitments
├── DESIGN.md                Design system: colours, type, layout, components, do's and don'ts
├── docs/
│   └── ARCHITECTURE.md      How the app is built today, and the phase-2 target
├── tasks/todo.md            Build checklist: phase 1 done; phase 2 and device checks open
├── scripts/
│   ├── check-dates.ts       Domain assertions (dates, money, summaries) in Africa/Lagos
│   ├── check-contrast.mjs   WCAG AA check over the theme tokens
│   └── ts-resolve.mjs       Node hook so plain `node` can import "./dates" as "./dates.ts"
├── assets/                  App icons, splash, iOS .icon bundle
└── src/
    ├── app/                 Routes (Expo Router). Every file is a screen; _layout files are navigators.
    │   ├── _layout.tsx      Root: fonts, splash, providers, signed-in / signed-out stacks
    │   ├── (tabs)/          Home (index), Expenses, Reports, Settings
    │   │   └── _layout.tsx      Floating finance dock with a raised + (expo-router/ui), every platform
    │   ├── expense/         new.tsx (add sheet), [id].tsx (edit sheet)
    │   ├── category/        [id].tsx (detail), edit.tsx (create/edit sheet)
    │   ├── categories.tsx   Categories and budgets list
    │   ├── account/delete.tsx
    │   ├── setup.tsx        Three-step setup after sign-up (and Settings → Redo setup)
    │   └── welcome.tsx, sign-in.tsx, sign-up.tsx, reset.tsx   (welcome = three intro slides)
    ├── components/          Shared UI: Row, Button, Field, T (text), PaceChart, Toast, ExpenseForm, …
    ├── data/                State and read hooks: store (async actions, launch state), expenses and summary hooks, month/today
    ├── db/                  SQLite: migrations, open, reads and writes (repo.ts, profile.ts). Only src/data uses it.
    ├── domain/              Pure TypeScript, no React: types, dates, money, summaries, starter categories
    ├── hooks/               Small platform hooks (colour scheme)
    └── theme/               Colour tokens (light and dark), type scale, spacing, web focus ring
```

Dependencies point one way only: **app → components → data → domain**, and every layer may use
**theme**. `src/domain/` imports nothing from React or React Native, so Node can test it directly.
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Screens and routes

| Route | File | Shown as | Purpose |
|---|---|---|---|
| `/` | `(tabs)/index.tsx` | Tab | Home: greeting, month total, pace line and chart, a glass card per currency, Quick add, budget cards, where it went, latest |
| `/expenses` | `(tabs)/expenses.tsx` | Tab | Stat cards, search, and the month grouped by day in panels |
| `/reports` | `(tabs)/reports.tsx` | Tab | Total, comparison cards, by category, month-by-month bars, share as PDF (stub) |
| `/settings` | `(tabs)/settings.tsx` | Tab | Account, Redo setup, main and second currency, appearance, categories, reminder, export, sign out, delete |
| `/expense/new?category=` | `expense/new.tsx` | Sheet | Add an expense (the category can be preset) |
| `/expense/[id]` | `expense/[id].tsx` | Sheet | Edit or delete an expense |
| `/category/[id]` | `category/[id].tsx` | Push | Category total, budget, activity, "Add to …" |
| `/category/edit?id=` | `category/edit.tsx` | Sheet | Create a category (no `id`) or edit one |
| `/categories` | `categories.tsx` | Push | All categories with their budgets |
| `/account/delete` | `account/delete.tsx` | Push | Type DELETE to confirm account deletion |
| `/setup` | `setup.tsx` | Full screen | After sign-up: your currencies (main and optional second), how hands-on, categories and up to four budgets |
| `/welcome` · `/sign-in` · `/sign-up` · `/reset` | root files | Stack | Signed-out screens; `/welcome` is three intro slides |

**Sheet** means a native form sheet on iOS and Android, and a full-screen card on the web.
Signed-in and signed-out screens sit in separate `Stack.Protected` groups, so after sign-out, Back
can never return to the old data. The deep-link scheme is `titoexpenses://` (for example
`titoexpenses://expense/new`).

---

## Rules that matter

The web tracker's bugs come back if these rules are broken.

1. **Money is an integer in minor units** (kobo, cents; whole units for XAF, XOF, UGX and JPY,
   which have no minor unit in ISO 4217), and every expense carries its `currency`.
   Symbols never clash: `$` is the US dollar, `CA$`, `A$`, `CN¥` and `¥` are distinct, the CFA
   francs are `FCFA` (XAF) and `CFA` (XOF), and letter symbols get a space (`USh 5,000`).
   Look a currency up with `currencyInfo(code)`, never `CURRENCIES[code]`: a code that is no longer
   on the list (older saved data) then still shows as its code with two decimals, instead of
   crashing, and its expenses are kept.
   Use `formatMoney()` and `parseAmount()` from `src/domain/money.ts`. Never store or add floats.
2. **Dates are local calendar strings.** A day is a `DayKey` (`"2026-11-23"`) and a month is a
   `MonthKey` (`"2026-11"`), both built from the device's local date parts. **Never use
   `toISOString()` for a date.** It returns UTC, and that is what broke month navigation in Nigeria.
   Use `src/domain/dates.ts`.
3. **Currencies are never converted or relabelled.**
   - The user picks a main currency (`settings.currency`) and an optional second one
     (`settings.secondCurrency`, null when none). They are always different.
   - Every total, chart and budget is in one currency. Home has a card per currency; Expenses and
     Reports show one at a time through the shared toggle (`useCurrencyView()`).
   - New expenses can only be in the user's currencies. Changing the main currency never relabels
     saved amounts.
   - A budget is in the currency it was set in (`budgetCurrency`), chosen per budget in setup and
     in Edit category, and only counts expenses in that currency.
   - Removing a currency keeps its expenses: they still show under that currency on Home and in
     the toggle, and editing one keeps its currency.
4. **Screens reach data only through hooks:** `useStore()`, `useActions()`, `useMonth()`,
   `useCurrencyView()`, `useSummary()` and the expense hooks in `src/data/expenses.ts`. Screens and
   components never import `src/db` or `expo-sqlite` (a test checks). Actions are async: show a
   toast or navigate only after the promise resolves, and say so calmly if it rejects.
5. **Add packages with `npx expo install <pkg>`**, not `npm install <pkg>`, so versions match SDK 58.
   Before using an Expo API, read the SDK 58 docs at `https://docs.expo.dev/versions/v58.0.0/`.
6. **Design rules.** The full list is in [DESIGN.md](DESIGN.md). The main ones:
   - one primary button per task screen;
   - aqua mint is the one pop, only on dark or blue surfaces (teal on light ones), never a fill;
   - burgundy means a budget passed or an error, always with words, and nothing is ever red;
   - the navy → royal → electric gradient is only on the Home header and onboarding, and never moves;
   - category colour appears only inside the icon disc;
   - Outfit everywhere; every amount uses tabular figures (Outfit's `tnum`).
7. **Colours come only from `src/theme/tokens.ts`.** After changing one, run `npm run check:contrast`.

---

## How to make common changes

**Add a screen.**
1. Create the file under `src/app/`.
2. Register it in the right `Stack.Protected` group in `src/app/_layout.tsx`, with a `title`. Screen
   readers and the web tab use the title. For a sheet, spread the `sheet` options.
3. Navigate with `router.push({ pathname, params })`. Typed routes catch bad paths at compile time.
4. Close sheets with `safeBack()` from `src/components/nav.ts`. It also handles a cold deep link
   that has nothing underneath.

**Add a store action.**
1. Write the database part in `src/db/repo.ts` (or `profile.ts`): async, in one
   `withTransactionAsync`, and append an outbox row with `enqueueChange()` if it changes user data.
2. In `src/data/store.tsx`, add it to `Actions` and to the `useMemo` block, wrapped in `write(…)` so
   it runs in the write queue. Call `changed()` after a write that changes expenses, so the read
   hooks re-query. Action identities must stay stable (that `useMemo` has an empty dependency list).
3. Add a test in `src/db/__tests__/`.

**Change the database schema.**
1. Append a migration to `MIGRATIONS` in `src/db/migrations.ts` with the next version number. Never
   edit one that has shipped. The rules for not losing data are at the top of that file.
2. Add a test to `src/db/__tests__/migrations.test.ts` that upgrades a database with rows in it.

**Read new data on a screen.** Add a hook to `src/data/expenses.ts` built on `useQuery()`, with
every argument the query uses as a key, and a read function in `src/db/repo.ts`. Add up totals in
SQL, not by looping over every expense.

**Add a currency.**
1. Add the code to `CURRENCY_CODES` in `src/domain/types.ts`.
   Its place in the list is its place in the picker, inside its region.
2. Add an entry to `CURRENCIES` in `src/domain/money.ts`: symbol (and whether it needs a space,
   like `KSh 1,200`), name, flag, the country shown, region, every country or place that uses it
   (for search), decimals (ISO 4217) and `sameBelow` (roughly a dollar's worth, in whole units).
   Pick a symbol that doesn't clash with another (`CA$`, not `$`). `parseAmount` strips every
   symbol and code automatically, and the pickers read `CURRENCIES`.
3. Add its expected output to the table in `scripts/check-dates.ts`, and update the order and
   region counts there.

**Add a category icon.**
1. Add the key to `CategoryIcon` in `src/domain/types.ts`.
2. Add the Tabler glyph to `CATEGORY_ICONS` in `src/components/icons.tsx`.
3. Add a light/dark colour pair to `categoryColors` in `src/theme/tokens.ts`.
4. Add a spoken name to `ICON_NAMES` in `src/app/category/edit.tsx`.
5. Run `npm run check:contrast`.

**Change date or money logic.**
1. Edit the function in `src/domain/`.
2. Add assertions to `scripts/check-dates.ts`.
3. Run `npm run check:dates`. Results must be correct in `Africa/Lagos` (UTC+1), the timezone the
   old tracker got wrong.

---

## Testing on devices

There is no iOS Simulator or Android SDK on the build Mac, so on-device checks use **Expo Go**:

1. Run `npx expo start` and scan the QR code (with the Camera app on iOS, or with Expo Go on Android).
2. Work through the device checklist in
   [tasks/todo.md](tasks/todo.md#check-on-real-devices-no-simulator-on-this-mac):
   - safe areas;
   - the dock and toast clearing the home indicator and Android navigation bar;
   - the keyboard not covering Save on Android;
   - VoiceOver and TalkBack;
   - 200% text.

For browser layout checks, use the web build at **390 × 844** in light and dark mode. Headless Chrome
won't go below 500 px wide, so use device emulation for phone widths.

In phase 2, the first native module that Expo Go doesn't include will require a **development
build** (`eas build --profile development`).

---

## What is stubbed in phase 1

| Feature | Now | Phase 2 part B |
|---|---|---|
| Data | **Done (part A):** SQLite on the device (expo-sqlite), empty at first launch, kept across restarts. Every change is also written to an outbox. | The outbox is sent to Supabase; changes from other devices come back into SQLite |
| Sign up / sign in | Validates the form, waits 0.5 s, then signs in locally; the signed-in state is saved | Supabase Auth with real error states |
| Password reset | Shows "sent" for any valid email | `resetPasswordForEmail` |
| Delete account | Wipes everything on the device after 0.6 s | Delete-account Edge Function first, with an error path; then the local wipe |
| Share report as PDF | Toast: "arrives in the next build" | expo-print + expo-sharing |
| Export CSV | Toast: "arrives in the next build" | Export through the share sheet |
| Daily reminder | The switch stores the setting only | Local notifications (expo-notifications) |
| Privacy policy | Toast | Link to the published policy |

The Settings footer reads "Preview build · your data is saved on this device" so testers know what to expect.

---

## Roadmap

- **Phase 1, screens in memory (no demo data).** Done. Waiting for Mr Tito's review and real-phone checks.
- **Phase 2 part A, on-device storage.** Done (`feature/nike-storage`): expo-sqlite with versioned
  migrations, an async store with a launch gate, soft deletes and Undo, an outbox, totals in SQL,
  and settings, sign-in and setup progress that survive restarts.
- **Phase 2 part B, real data online.** See [tasks/todo.md](tasks/todo.md) and
  [docs/ARCHITECTURE.md §10](docs/ARCHITECTURE.md#10-phase-2-target-architecture). Scope:
  - Supabase schema and RLS;
  - auth, and syncing the outbox;
  - one local database per user;
  - account deletion on the server.
- **Later:**
  - reminders, PDF and CSV;
  - store preparation (EAS, privacy labels, Data safety);
  - TestFlight and Play closed-test beta;
  - launch.

Scope is owned by `proposals/tito-expense-app/PLAN.md` in the Koret Tech repo.

---

## Documentation map

| Document | Read it for |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the code is organised, how data flows, why it is built this way, and the phase-2 design |
| [PRODUCT.md](PRODUCT.md) | Users, purpose, principles and brand commitments |
| [DESIGN.md](DESIGN.md) | The design system: colours, type, components and rules |
| [tasks/todo.md](tasks/todo.md) | What is done, what is next, and the device checklist |
| [AGENTS.md](AGENTS.md) | Rules for AI coding agents in this repo |
| `PLAN.md` (Koret Tech repo) | Analysis of the old web tracker, the PRD, MVP, delivery plan, costs and risks |

---

Built by Koret Tech for Tito Finance. Private repository.
