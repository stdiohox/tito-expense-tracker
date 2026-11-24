# Tito Expenses

A phone app (iOS and Android) for logging what you spend in seconds and seeing your month at a glance.
Built by Koret for **Tito Finance**. It replaces the web tracker at `expenses.titofinance.com`.

> **Status: phase 1, screens on sample data.** Every screen works, but the data is synthetic and
> lives in memory. There are no real accounts, no sync and no backend yet. Phase 2 adds on-device
> storage (expo-sqlite) and a Supabase backend owned by Koret. It starts after Mr Tito approves
> the screens.

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
- **Two currencies (NGN and USD).** Each expense keeps the currency it was entered in. Changing the
  main currency never relabels saved amounts. Other-currency spending is counted separately and
  never converted.
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
only. In phase 1 they don't talk to a server. See [What is stubbed](#what-is-stubbed-in-phase-1).

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

The app opens signed in as a sample user ("Ada"), with the last three months of synthetic spending in
Lagos. To see the welcome and auth screens, use **Settings → Sign out**. **Delete account** clears the
sample data until the next reload.

### Static web build

```bash
npx expo export -p web   # writes a single-page app to dist/ (git-ignored)
```

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
| `npx expo-doctor` | Checks dependency versions and config against SDK 58 |

**Before you push**, run:

```bash
npm run typecheck && npm run lint && npm run check:dates && npm run check:contrast && npx expo-doctor
```

There is no unit-test runner yet. `scripts/check-dates.ts` is the domain test suite: plain
`node:assert` checks on the pure functions in `src/domain/`. Add new domain cases there.

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
    ├── data/                State: store (phase 1: in memory), month/today provider, summary hook, sample data
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
| `/` | `(tabs)/index.tsx` | Tab | Home: greeting, month total, pace line and chart, glass currency cards, Quick add, budget cards, where it went, latest |
| `/expenses` | `(tabs)/expenses.tsx` | Tab | Stat cards, search, and the month grouped by day in panels |
| `/reports` | `(tabs)/reports.tsx` | Tab | Total, comparison cards, by category, month-by-month bars, share as PDF (stub) |
| `/settings` | `(tabs)/settings.tsx` | Tab | Account, Redo setup, main currency, appearance, categories, reminder, export, sign out, delete |
| `/expense/new?category=` | `expense/new.tsx` | Sheet | Add an expense (the category can be preset) |
| `/expense/[id]` | `expense/[id].tsx` | Sheet | Edit or delete an expense |
| `/category/[id]` | `category/[id].tsx` | Push | Category total, budget, activity, "Add to …" |
| `/category/edit?id=` | `category/edit.tsx` | Sheet | Create a category (no `id`) or edit one |
| `/categories` | `categories.tsx` | Push | All categories with their budgets |
| `/account/delete` | `account/delete.tsx` | Push | Type DELETE to confirm account deletion |
| `/setup` | `setup.tsx` | Full screen | After sign-up: main currency, how hands-on, categories and up to two budgets |
| `/welcome` · `/sign-in` · `/sign-up` · `/reset` | root files | Stack | Signed-out screens; `/welcome` is three intro slides |

**Sheet** means a native form sheet on iOS and Android, and a full-screen card on the web.
Signed-in and signed-out screens sit in separate `Stack.Protected` groups, so after sign-out, Back
can never return to the old data. The deep-link scheme is `titoexpenses://` (for example
`titoexpenses://expense/new`).

---

## Rules that matter

The web tracker's bugs come back if these rules are broken.

1. **Money is an integer in minor units** (kobo or cents), and every expense carries its `currency`.
   Use `formatMoney()` and `parseAmount()` from `src/domain/money.ts`. Never store or add floats.
2. **Dates are local calendar strings.** A day is a `DayKey` (`"2026-11-23"`) and a month is a
   `MonthKey` (`"2026-11"`), both built from the device's local date parts. **Never use
   `toISOString()` for a date.** It returns UTC, and that is what broke month navigation in Nigeria.
   Use `src/domain/dates.ts`.
3. **Currencies are never converted or relabelled.** Totals use the main currency. Other currencies
   show as "Plus $14.99 in USD, counted separately". A budget only applies in the currency it was
   set in.
4. **Screens reach data only through hooks:** `useStore()`, `useActions()`, `useMonth()` and
   `useSummary()`. Because of this boundary, phase 2 can replace the storage without rewriting
   screens.
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
1. In `src/data/store.tsx`, add an `Action` variant and its `reducer` case.
2. Add the function to `Actions` and to the `useMemo` block. Action identities must stay stable (that
   `useMemo` has an empty dependency list).
3. When the action needs the current state, read it from the `latest` ref, not from a closure.

**Add a currency.**
1. Add the code to `CurrencyCode` in `src/domain/types.ts`.
2. Add an entry to `CURRENCIES` in `src/domain/money.ts`: symbol, name, minor units per major
   unit, and `sameBelow` (the smallest month-to-month difference worth mentioning, in minor units).
   The pickers read `CURRENCIES`, so the UI updates on its own.
3. Extend the symbol-stripping regex in `parseAmount`. It only strips `₦` and `$` today.
4. Add cases to `scripts/check-dates.ts`.

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

| Feature | Phase 1 behaviour | Phase 2 |
|---|---|---|
| Data | In memory, seeded from `src/data/sample.ts` on each launch; lost on reload | expo-sqlite on the device plus an outbox, synced to Supabase |
| Sign up / sign in | Validates the form, waits 0.5 s, then signs in locally | Supabase Auth with real error states |
| Password reset | Shows "sent" for any valid email | `resetPasswordForEmail` |
| Delete account | Clears local data after 0.6 s | Delete-account Edge Function, with an error path |
| Share report as PDF | Toast: "arrives in the next build" | expo-print + expo-sharing |
| Export CSV | Toast: "arrives in the next build" | Export through the share sheet |
| Daily reminder | The switch stores the setting only | Local notifications (expo-notifications) |
| Privacy policy | Toast | Link to the published policy |

The Settings footer reads "Preview build · showing sample data" so testers know what they are seeing.

---

## Roadmap

- **Phase 1, screens on sample data.** Done. Waiting for Mr Tito's review and real-phone checks.
- **Phase 2, real data.** See [tasks/todo.md](tasks/todo.md) and
  [docs/ARCHITECTURE.md §10](docs/ARCHITECTURE.md#10-phase-2-target-architecture). Scope:
  - expo-sqlite store and outbox;
  - Supabase schema and RLS;
  - auth and sync;
  - account deletion;
  - an async store API with soft deletes;
  - aggregates computed in SQL.
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
