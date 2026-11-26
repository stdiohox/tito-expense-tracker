# Architecture: TET (Tito Finance Expense Tracker)

How the app is built today (phase 1), why it is built that way, and the target design for phase 2
(real data, sync and a Supabase backend).

| | |
|---|---|
| **Applies to** | phase 2 part A: data saved on the device in SQLite (no backend yet, no demo data) |
| **Last updated** | 2026-11-26 |
| **Scope source** | `proposals/tito-expense-app/PLAN.md` in the Koret Tech repo. Decision D1 = **Track B**: Koret builds its own backend (2026-11-09). |
| **Status key** | **Built**: in the code now. **Planned**: agreed in PLAN.md or `tasks/todo.md`, not built. **Proposed**: this document's recommendation, not yet decided. |

## Contents

1. [System context](#1-system-context)
2. [Technology stack](#2-technology-stack)
3. [Layers and dependency rules](#3-layers-and-dependency-rules)
4. [Runtime composition](#4-runtime-composition)
5. [Navigation](#5-navigation)
6. [Domain model](#6-domain-model)
7. [State and data flow (phase 1)](#7-state-and-data-flow-phase-1)
8. [Key flows](#8-key-flows)
9. [UI system, platforms and accessibility](#9-ui-system-platforms-and-accessibility)
10. [Phase 2 target architecture](#10-phase-2-target-architecture)
11. [Quality gates](#11-quality-gates)
12. [Architecture decisions](#12-architecture-decisions)
13. [Known limitations and open questions](#13-known-limitations-and-open-questions)
14. [Glossary](#14-glossary)

---

## 1. System context

### Today (phase 2 part A, built)

The app is self-contained. Everything runs on the device and is saved in SQLite, so it survives
restarts. Nothing leaves the phone. Every change is also recorded in an outbox, ready for part B.

```mermaid
flowchart LR
  user([Tito Finance user]) --> app["Tito Expenses app<br/>Expo / React Native<br/>iOS · Android · web preview"]
  app --> sqlite[("expo-sqlite on the device<br/>expenses, categories, settings, outbox")]
```

### Target (phase 2 and launch, planned)

```mermaid
flowchart LR
  user([User]) --> app["Tito Expenses app"]
  app --> sqlite[("expo-sqlite<br/>local DB + outbox")]
  app -- "HTTPS · Supabase JS" --> auth["Supabase Auth"]
  app -- "HTTPS · PostgREST / RPC" --> db[("Supabase Postgres<br/>Row-Level Security")]
  app -- "HTTPS" --> fn["Edge Function<br/>delete-account"]
  fn --> auth
  fn --> db
  app --> notif["Local notifications<br/>(daily reminder)"]
  app --> share["OS share sheet<br/>(PDF report, CSV)"]
  eas["EAS Build / Submit / Update"] -. ships .-> stores["App Store · Google Play"]
```

The old web tracker (`expenses.titofinance.com`) runs on a third-party backend (`aangoo-server`) that
Koret does not control. **The app does not talk to it.** Existing web users start fresh, unless the
owner of that backend provides an export (PLAN.md §7.2, Track B).

---

## 2. Technology stack

| Concern | Choice | Status |
|---|---|---|
| Framework | Expo SDK 58, React Native 0.88, React 19.3 | Built |
| Language | TypeScript 6, `strict: true`, path alias `@/*` → `src/*` | Built |
| Compiler | React Compiler (`experiments.reactCompiler` in `app.json`) | Built |
| Navigation | Expo Router 58: file-based routes, typed routes, `Stack.Protected`, `expo-router/ui` tabs with a floating finance dock | Built |
| State | React Context over SQLite: async actions through a write queue; read hooks keyed on a data version | Built (phase 2 part A) |
| Charts | `react-native-svg`, hand-drawn (pace line, bars) | Built |
| Animation | `react-native-reanimated` 4 (toast), honours Reduce Motion | Built |
| Icons | Tabler (`@tabler/icons-react-native`), stroke 1.75, including the tab bar | Built |
| Fonts | Outfit 400, 500, 600 via `@expo-google-fonts/outfit`; tabular figures through its `tnum` feature | Built |
| IDs | `expo-crypto` `randomUUID()` (client-generated) | Built |
| Haptics | `expo-haptics` | Built |
| Local database | `expo-sqlite`, with versioned migrations (`PRAGMA user_version`), an outbox and soft deletes. Web: wa-sqlite in a worker, needs cross-origin isolation headers | Built (phase 2 part A) |
| Backend | Supabase: Postgres, Auth, RLS, an Edge Function | Planned |
| Network state | NetInfo (to know when to flush the outbox) | Planned (PLAN §7.1) |
| Token storage | `expo-secure-store` (Keychain / Keystore) | Planned |
| Notifications | `expo-notifications` (local daily reminder) | Planned |
| PDF and CSV | `expo-print` + `expo-sharing` | Planned |
| Crash reporting | Sentry | Planned (PLAN §7.1) |
| Builds and releases | EAS Build / Submit / Update with a `runtimeVersion` policy | Planned |

---

## 3. Layers and dependency rules

```mermaid
flowchart TD
  A["src/app<br/>routes and screens"] --> C["src/components<br/>shared UI"]
  A --> D["src/data<br/>store, month, summary hooks"]
  C --> D
  D --> DB["src/db<br/>SQLite: migrations, repo, profile"]
  DB --> M
  D --> M["src/domain<br/>pure TS: types, dates, money, summary"]
  C --> M
  A --> M
  A --> T["src/theme<br/>tokens, useTheme"]
  C --> T
  T --> M
```

| Layer | Folder | Holds | May import |
|---|---|---|---|
| **Routes** | `src/app/` | Screens and navigators. Each file is a route; `_layout.tsx` files define navigators. | everything below |
| **Components** | `src/components/` | Reusable UI (`Row`, `Button`, `Field`, `T`, `PaceChart`, `Toast`, `ExpenseForm`, `ScreenHero`, `MonthSwitcher`, …) and small UI helpers (`nav.ts`, `announce.ts`, `tab-bar.ts`) | data, domain, theme |
| **Data** | `src/data/` | State providers and hooks: `store.tsx`, `expenses.ts`, `use-summary.ts`, `month.tsx`, `currency-view.tsx`, `write-queue.ts` | db, domain |
| **Database** | `src/db/` | SQLite: `migrations.ts`, `open.ts`, `repo.ts` (expenses, totals, outbox), `profile.ts` (categories, settings) | domain |
| **Domain** | `src/domain/` | Pure functions and types: `types.ts`, `dates.ts`, `money.ts`, `summary.ts`, `categories.ts` | only other domain files |
| **Theme** | `src/theme/` | `tokens.ts` (palettes, category colours, spacing, radius, type), `use-theme.ts`, `web-focus.ts` | domain types only |

**Rules**

1. **Domain is pure.** No React, no React Native, no `Date.now()` hidden inside calculations (callers
   pass `now` or `today`). This is why `scripts/check-dates.ts` can run it in plain Node under a
   forced timezone.
2. **Screens never touch storage directly.** They read through `useStore()`, `useMonth()`,
   `useSummary()` and the hooks in `data/expenses.ts`, and write through `useActions()`. Nothing
   in `src/app` or `src/components` imports `src/db` or `expo-sqlite`;
   `src/__tests__/boundaries.test.ts` fails if one does.
3. **Non-route code stays out of `src/app/`.** Expo Router treats every file there as a screen.
4. **Colours come only from `src/theme/tokens.ts`.** Components ask `useTheme()` for the palette
   (`c`) and never hard-code a hex. That includes the toast, the Welcome button label, shadows,
   switch thumbs and the web focus ring; the contrast check covers every text and indicator pair.

---

## 4. Runtime composition

`src/app/_layout.tsx` is the root. It keeps the splash screen up until the fonts load (or fail) and
the database has opened (or failed), then mounts the provider tree:

```
GestureHandlerRootView
└─ SafeAreaProvider
   └─ StoreProvider            (opens SQLite and migrates; categories, settings, signedIn, setupStep + actions)
      └─ StoreGate             (database opening: StartupLoading; failed: StartupError with Try again)
         └─ AppearanceProvider
            └─ ThemeProvider   (React Navigation theme built from our tokens; light or dark)
               └─ MonthProvider      (viewed month, current month, local "today")
                  └─ CurrencyViewProvider
                     └─ ToastProvider   (one snackbar for the whole app, rendered above everything)
                        └─ Routes       (Stack with Stack.Protected groups)
```

**The launch gate.** `StoreProvider` opens the database (`db/open.ts`: open, WAL on phones,
`migrate()`), writes the starter categories on a first launch, and reads categories, settings,
sign-in state and setup progress into memory. Until then nothing below `StoreGate` renders, and the
splash stays up (`StartupLoading` shows a spinner only if it takes over 400 ms). If opening fails
(a damaged file, a schema from a newer app, or a web page served without the isolation headers),
`StartupError` says so calmly, says nothing was deleted, and offers **Try again**, which reopens.

The order matters:

- `MonthProvider` sits inside `StoreProvider` so month-aware hooks can read the store.
- `ToastProvider` sits inside both, so a toast's **Undo** can call store actions.
- The toast renders as a sibling after the navigator, so it floats over every screen, including sheets.

`unstable_settings = { anchor: '(tabs)' }` means a cold deep link straight to a sheet (for example
`titoexpenses://expense/new`) still mounts the tabs underneath it. Closing the sheet then lands
somewhere sensible.

---

## 5. Navigation

### Route tree

```
Stack (root)
├─ Protected guard = signedIn
│  ├─ (tabs)                 expo-router/ui tabs, floating finance dock on every platform
│  │  ├─ index      Home
│  │  ├─ expenses   Expenses
│  │  ├─ reports    Reports
│  │  └─ settings   Settings
│  ├─ expense/new            sheet
│  ├─ expense/[id]           sheet
│  ├─ category/[id]          push (header "Edit" button)
│  ├─ category/edit          sheet
│  ├─ categories             push
│  ├─ account/delete         push
│  └─ setup                  full screen (after sign-up; Settings → Redo setup)
└─ Protected guard = !signedIn
   ├─ welcome                fade (three intro slides)
   ├─ sign-in
   ├─ sign-up
   └─ reset
```

### Design points

- **Auth gating uses `Stack.Protected`, not redirects.** When `signedIn` flips, the screens of the
  other group are removed from history. Once signed out, there is no back gesture into the old
  data. This matters most after account deletion.
- **Sheets.** On iOS and Android these are native `formSheet`s (grabber, one detent at full height).
  The web stack has no form sheet, so the same options choose `card` when `Platform.OS === 'web'`.
- **Tabs are sections, not actions.** Adding an expense is the raised + in the middle of the
  dock, a plain button inside `TabList` (only `TabTrigger`s become tabs), not a tab.
- **Finance dock.** `(tabs)/_layout.tsx` uses `expo-router/ui` (`Tabs`, `TabList`,
  `TabTrigger`, `TabSlot`) to draw one floating dock of frosted white glass (88% wide, the same in
  both modes, `dock` and `dockGlass` tokens) with a raised Add button in the middle, on iOS,
  Android and the web. The system tab bar can't take this look, so `NativeTabs` was dropped
  in the redesign. Every tab opens with `ScreenHero` (`components/screen-hero.tsx`): the brand
  gradient with its top-right flare, rendered in the light palette in both modes, and fading into
  the current mode's ground. The rest of each screen follows the Appearance setting. The bar overlays the
  content: `useTabBarClearance()` (`components/tab-bar.ts`) tells screens and the toast how much
  room to leave (the dock, its raised + and the safe area), and the bar steps aside while the keyboard is open.
- **Appearance.** `settings.appearance` (System, Light, Dark) reaches `useTheme()` through
  `AppearanceProvider`; on iOS and Android `Appearance.setColorScheme` also switches native UI.
  `AppearanceProvider mode="dark"` is also how dark panels (Quick add, Latest, the tab bar) render
  their contents in the dark palette in light mode.
- **Setup.** Sign-up replaces to `/setup`; its Finish calls `router.dismissTo('/')`. Hidden
  categories (`Category.hidden`) leave pickers but still count in every total.
- **`safeBack()`** (`components/nav.ts`) goes back if it can, and otherwise replaces to `/`. It
  covers a sheet opened from a cold deep link, where there is nothing to go back to.
- **Typed routes** are on, so `router.push({ pathname: '/expense/[id]', params: { id } })` is
  checked at compile time.
- **Screen titles.** Every screen registers a `title` for screen readers and the browser tab, even
  where the visible header is blank (`headerTitle: ''`).

---

## 6. Domain model

All in `src/domain/`. Pure, synchronous, tested by `scripts/check-dates.ts`.

### 6.1 Types (`types.ts`)

```ts
type CurrencyCode = 'NGN' | 'USD';
type MonthKey = `${number}-${string}`;              // "2026-11"     local calendar month
type DayKey   = `${number}-${string}-${string}`;    // "2026-11-23"  local calendar day

type Category = {
  id: string;                     // starter: slug ("food"); custom: UUID
  name: string;
  icon: CategoryIcon;             // one of 16 keys
  budget: number | null;          // monthly, minor units; null = no budget
  budgetCurrency?: CurrencyCode;  // a budget never silently changes currency
  builtIn: boolean;               // starter categories keep their name and icon
};

type Expense = {
  id: string;                     // client-generated UUID, stable across sync
  amount: number;                 // minor units, always > 0
  currency: CurrencyCode;         // stored per expense; never relabelled
  categoryId: string;
  day: DayKey;                    // the local day the money was spent
  note: string;                   // optional, up to 120 characters
  createdAt: number;              // epoch ms
  updatedAt: number;              // epoch ms
};
```

```mermaid
erDiagram
  CATEGORY ||--o{ EXPENSE : "categoryId"
  CATEGORY {
    string id
    string name
    string icon
    int budget "minor units, nullable"
    string budgetCurrency "nullable"
    bool builtIn
  }
  EXPENSE {
    string id "UUID"
    int amount "minor units > 0"
    string currency "NGN | USD"
    string categoryId
    string day "YYYY-MM-DD local"
    string note
    int createdAt
    int updatedAt
  }
```

### 6.2 Dates (`dates.ts`)

**The rule:** every day and month key is built from the device's *local* date parts
(`getFullYear`, `getMonth`, `getDate`), never from `toISOString()`, which is UTC.

On the web tracker, `toISOString()` meant that in Lagos (UTC+1):

- "next month" did nothing;
- "previous month" skipped a month (bug B1);
- between midnight and 1 am the default date was yesterday (bug B3).

| Function | Purpose |
|---|---|
| `dayKey(d)`, `monthKey(d)`, `todayKey(now)` | `Date` → key, from local parts |
| `parseDay`, `parseMonth`, `monthOfDay`, `dayOfMonth`, `daysInMonth` | Key arithmetic |
| `addMonths(m, n)` | Built on day 1 at local midnight, which never overflows into a neighbouring month |
| `addDays(d, n)` | Built with the `Date` constructor, so DST changes are safe |
| `monthName`, `monthLabel`, `shortMonth`, `dayLabel`, `shortDay` | English labels: "Today", "Yesterday", "Monday 3 November", "9 Nov". The year is added only when it isn't the current one. |

Keys are fixed-width ISO-like strings, so **comparing them as strings is comparing dates**
(`a < b`, `m > current`). The code relies on this when sorting and clamping.

### 6.3 Money (`money.ts`)

- **Storage:** integer minor units (`₦2,500` → `250000`). Every currency in `CURRENCIES` declares
  `minor: 100`.
- **`formatMoney(minor, currency, { compact?, signed? })`** is hand-rolled rather than `Intl`, so the
  output is identical on Hermes (iOS and Android) and on the web. Rules:
  - grouping commas;
  - decimals only when the amount has them;
  - a true minus sign (`−`) for negative amounts;
  - compact mode gives `₦45k` and `₦1.2m` (and rounds `999,600` up to `₦1m`, never `1000k`).
- **`parseAmount(text, currency)`** turns what the user typed into minor units, or `null`. It accepts:
  - `2500`, `2,500` and `1,250.50`;
  - `.5` and `5.`;
  - decimal commas from comma-decimal phone keyboards: `12,5` → ₦12.50 (never ₦125), and `1.250,50`.

  It rejects ambiguous input (`12.345`, `1,2,3`), zero, and anything that isn't a safe integer.
- **`amountToInput(minor, currency)`** goes back to an editable string for the edit form.

### 6.4 Summaries (`summary.ts`)

**`summarise(expenses, categories, month, currency) → MonthSummary`** makes one pass over the
expenses:

- It skips other months.
- It moves expenses in other currencies to `otherCurrencies`. They are totalled, never converted.
- It skips malformed days (for example `2026-02-31`) so the chart never gets `NaN`.
- An expense whose category no longer exists is counted under **Other** (or the first category).
- It builds `perDay`, then a **cumulative** array (index 0 = day 1). The pace chart draws from this.
- `byCategory` contains only categories with spending, sorted by total, largest first.

**`pace(current, previous, today)`** compares this month with last month at the same day of the
month:

- `day` is today's day of the month when viewing the current month, or the month's last day for a
  past month.
- Last month's figure is read at `min(day, last month's length)`, so 31 March compares with
  28/29 February.
- It returns `null` when last month has no spending. There is nothing to compare against.
- `delta > 0` means spending faster than last month.

**`compareWords(delta, base, currency)`** returns `'same'` when the difference is under the
currency's `sameBelow` floor (₦100 or $1, set in `CURRENCIES`) or under 2% of last month's figure,
whichever is larger. Otherwise it returns `'less'` or
`'more'`. Home and Reports both use it, so they always word comparisons the same way.

**`budgetFor(category, currency)`** returns the budget only when it was set in the currency being
viewed.

### 6.5 Starter categories (`categories.ts`)

These are the twelve categories from the web tracker, in its order, with slug ids: `rent`, `food`,
`transport`, `bills`, `airtime`, `family`, `faith`, `personal`, `health`, `entertainment`,
`shopping`, `other`. Custom categories get UUIDs and can use four more icons: `savings`,
`education`, `gift`, `business`.

---

## 7. State and data flow (phase 2 part A)

### 7.1 The database (`src/db/`)

| Table | Holds | Notes |
|---|---|---|
| `expenses` | one row per expense: amount (minor units), currency, category_id, day, note, version | Indexes on `day`, `category_id`, `currency` and `(currency, day)`. Deleted rows stay as tombstones (`deleted_at`). |
| `categories` | starters and custom categories: name, icon, budget, budget_currency, built_in, hidden, position, version | The starter set is written on first launch and after account deletion. |
| `settings` | one row per setting: id = name, value = JSON | Preferences, plus device-only `signedIn` and `setupStep`. |
| `outbox` | one row per change: entity, entity_id, op (`create`, `update`, `delete`, `restore`), the row after the change, base_version | Written in the same transaction as the change. Nothing sends it yet (part B). |

Every table has `id`, `user_id` (null until part B), `created_at`, `updated_at` and `deleted_at`.
Times are epoch milliseconds.

- **Migrations** (`db/migrations.ts`): `PRAGMA user_version` holds the schema version. On every
  launch `migrate()` runs each newer migration in its own transaction together with the version
  bump, so a migration lands completely or not at all. Migrations are append-only, additive first,
  and never delete user rows; a reshape copies rows across inside one migration. A database from a
  newer app is refused (the error screen), never written into. Version 1 is the schema; version 2
  adds the `(currency, day)` index.
- **Reads are synchronous** (`getAllSync`): indexed queries for one month, well under a
  millisecond for a normal month, so screens render straight from SQLite with no loading flash.
  **Writes are async**, each in one `withTransactionAsync`, and checked before storing (positive
  whole minor units, a real calendar day via `toDayKey`, a known currency).
- **On the web**, expo-sqlite runs wa-sqlite in a worker that talks to the page through
  `SharedArrayBuffer`, so the page must be cross-origin isolated (`Cross-Origin-Embedder-Policy:
  credentialless`, `Cross-Origin-Opener-Policy: same-origin`). The dev server sends them
  (`metro.config.js`, which also serves `.wasm`), and `public/_headers`, `public/serve.json` and the
  `expo-router` plugin in `app.json` cover hosting.
- **In Jest**, `expo-sqlite` maps to `jest.sqlite.js`, which runs the same SQL on Node's built-in
  `node:sqlite`. Databases live in memory per name and survive "closing", which is how tests restart
  the app.

### 7.2 Store (`data/store.tsx`)

```ts
type State = {
  categories: Category[];
  settings: Settings;          // currency, secondCurrency, appearance, mode, reminder, name, email
  signedIn: boolean;
  setupStep: number | null;    // a new account's setup step; null when done
};
```

Expenses are not held in React state; they are read from SQLite by the hooks in §7.4.

- **Contexts.** `StateCtx` (the state above), `ActionsCtx` (actions, built once so their
  identities never change), `StatusCtx` (`ready`, `error`, `retry` for the launch gate) and `DbCtx`
  (the open database and a data `version`, for the read hooks only).
- **Async actions.** Every action returns a promise that resolves after the write is saved, and
  rejects if it fails. All writes go through one `WriteQueue`, one at a time, in order. After a
  write that changes expenses, `version` goes up and every read hook re-queries.
- **Callers wait.** The expense sheet shows "Saved …", vibrates and closes only after
  `addExpense` resolves; on failure the sheet stays open with what was typed, and a toast says
  "couldn't be saved. Try again." Setup, sign-in, sign-up, sign-out, Edit category and Delete
  account work the same way.
- **Settings show at once.** `updateSettings` updates the screen immediately (so a switch or picker
  never jumps back), then saves only what changed. If saving fails, the saved values are read back
  and the promise rejects.
- **Soft delete and Undo.** `deleteExpense` sets `deleted_at` (and `updated_at` and a new
  `version`) and returns the expense as it was. A second delete finds nothing, so a double tap
  can't delete twice; `updateExpense` returns `false` for a deleted expense (a delete wins).
  `restoreExpense` (Undo) clears `deleted_at` with an `updated_at` strictly newer than the delete,
  even if the phone's clock went back, and a new `version`, so a sync can't bring the delete back.
- **Outbox.** Every create, edit, delete and Undo of an expense, every category save and every
  preference change writes an outbox row in the same transaction. Sign-in state and setup progress
  are device-only and don't. The development stress data writes none.
- **Sign out** saves `signedIn = false` and keeps everything on the device; signing in again shows it.
- **`deleteAccount`** wipes all four tables, writes the starter categories again, and resets the
  state to defaults, signed out.

Public hooks:

| Hook | Returns |
|---|---|
| `useStore()` | `State` |
| `useActions()` | `addExpense`, `updateExpense`, `deleteExpense`, `restoreExpense`, `saveCategory`, `updateSettings`, `signIn({ newAccount })`, `signOut`, `setSetupStep`, `deleteAccount`, `loadStressData` (development only); all async |
| `useStoreStatus()` | `ready`, `error`, `retry` (root layout only) |
| `useCategory(id)` | One category, or `undefined` |

### 7.3 Month and "today" (`data/month.tsx`)

`MonthProvider` holds the month being viewed. Home, Expenses and Reports share it, so switching the
month on one tab switches it on all three.

- **`today` stays fresh.** It is recomputed when the app returns to the foreground (`AppState`) and
  by a timer set for one second past the next local midnight. A phone left open across the 1st
  moves into the new month.
- **It follows the current month.** While the user is viewing the current month (`followCurrent`),
  the view rolls forward with the calendar. After they navigate back, it stays on the month they
  chose.
- **Navigation is clamped.** `next()` never goes past the current month.

### 7.4 Reading data (`data/expenses.ts`, `data/use-summary.ts`)

Every read hook is built on `useQuery(read, …keys)`: it runs a synchronous query, and runs it again
only when the data `version` or one of its keys changes. Otherwise it returns the same object, so
memoised children (each day on Expenses) don't redraw.

| Hook | Query |
|---|---|
| `useSummary(month, currency?)` | `repo.monthGroups` for this month and last, through `summariseGroups()` |
| `useMonthSummaries(month, codes)` | One `monthGroups` query, split by currency (Home's cards and budgets) |
| `useMonthTotals(months, currency)` | One `GROUP BY month` query (Reports → Month by month) |
| `useMonthExpenses(month, currency)` | The month's rows in one currency, newest first (Expenses) |
| `useRecentExpenses(month, n)` | Home → Latest |
| `useExpense(id)` | The edit sheet |
| `useCategoryMonth(id, currency, month)` | Category detail: the month's rows, and last month's total in SQL |
| `useExpenseCount()`, `useUsedCurrencies()`, `useFirstMonth()` | Delete account, the currency toggle, Reports' first month |

**Totals are added up in SQL.** `repo.monthGroups()` is one `GROUP BY currency, category_id, day`
query per month: at most currencies × categories × days rows, however many expenses there are.
`summariseGroups()` (pure, in `domain/summary.ts`) builds the `MonthSummary` from them, with the
same rules as `summarise()`: other currencies kept apart, an unknown category counted under Other,
malformed days skipped. `summarise()` stays as the reference; `src/db/__tests__/totals.test.ts`
checks both agree in all 20 currencies. Screens never add up amounts themselves, except the
Expenses tab's per-day subtotals and category detail's month total, which add the rows already on
screen. Search filters the month's rows already read; a keystroke never queries.

### 7.5 Starting state (no demo data)

The first launch writes the twelve starter categories (no budgets); settings are the defaults and
the user is signed out. The app opens on the onboarding slides, so testers create their own account
(sign-up leads through setup) and every figure on screen is one they entered. From then on the app
opens where the user left it: signed in on Home, or back in setup at the step they reached
(`Stack.Protected guard={setupStep === null} redirectTo="/setup"`).

---

## 8. Key flows

### 8.1 Add an expense

```mermaid
sequenceDiagram
  actor U as User
  participant FAB as Dock +
  participant F as ExpenseForm (sheet)
  participant D as domain/money
  participant S as Store
  participant T as Toast
  U->>FAB: tap "Add expense"
  FAB->>F: router.push('/expense/new')
  F->>F: focus amount (skipped if a screen reader is on)
  U->>F: amount, category, date, note → Save
  F->>D: parseAmount(text, currency)
  alt invalid amount or no category
    F->>U: inline error + warning haptic + announce, focus moves to the field
  else valid
    F->>S: await addExpense({amount, currency, categoryId, day, note})
    S->>S: INSERT expense + outbox row (one transaction), version + 1
    alt saved
      S-->>F: Expense (UUID, createdAt = updatedAt = now)
      F->>T: "Saved ₦2,500 to Food & Groceries"
      F->>F: success haptic, safeBack()
    else the write failed
      S-->>F: rejects
      F->>T: "This expense couldn't be saved. Try again." (sheet stays open)
    end
  end
```

A `busy` ref guards against double-submits. The date stepper can't go past today. On iOS it
announces the new date, because iOS has no live regions.

### 8.2 Delete with Undo

```mermaid
sequenceDiagram
  actor U as User
  participant F as Edit sheet
  participant S as Store
  participant T as Toast
  U->>F: Delete expense
  F->>S: await deleteExpense(id)
  S->>S: deleted_at = now, version + 1, outbox "delete" (one transaction)
  S-->>F: the expense as it was (or undefined if already gone)
  F->>F: safeBack()
  F->>T: "Deleted ₦2,500" + Undo (6 s, or 20 s with a screen reader)
  opt user taps Undo
    T->>S: restoreExpense(removed)
    S->>S: deleted_at = NULL, updated_at > the delete, version + 1, outbox "restore"
  end
```

The edit screen keeps the last expense it found in local state, so the sheet doesn't flash "This
expense is no longer here" while it animates away. That empty state is still shown when an
expense really is missing, for example after a deep link to a deleted id (or, in phase 2, one
deleted on another device).

### 8.3 Month rollover

```mermaid
sequenceDiagram
  participant OS as OS / timer
  participant M as MonthProvider
  participant Scr as Home / Expenses / Reports
  OS->>M: midnight timer fires, or app becomes active
  M->>M: today = dayKey(new Date())
  alt user was following the current month
    M-->>Scr: month = new current month
  else user had navigated to a past month
    M-->>Scr: month unchanged, isCurrent recomputed
  end
```

### 8.4 Sign-out and account deletion

- **Sign out:** `signOut()` saves `signedIn = false`. `Stack.Protected` removes every signed-in
  screen, and the app replaces to `/welcome`. The data stays on the device: signing in again shows
  it. (Part B makes the database one file per user, §10.5.)
- **Delete account:** the user types `DELETE`. `deleteAccount()` wipes every table on the device,
  writes the starter categories again, and the app replaces to `/welcome`. If the wipe fails, the
  button resets and a toast says so. This is local only for now; part B calls the Edge Function
  first and only wipes local data once the server confirms (§10.6).
- **Setup progress:** sign-up calls `signIn({ newAccount: true })`, which saves `setupStep = 0`;
  each step saves the next one; Finish saves `null`. While it isn't null, a nested
  `Stack.Protected` keeps every signed-in screen except `/setup` closed, so reopening the app mid-setup
  lands back on the same step. Redo setup from Settings doesn't use it.

---

## 9. UI system, platforms and accessibility

### 9.1 Theme

- **Tokens** (`theme/tokens.ts`):
  - `light` and `dark` palettes of the same shape (`Palette`);
  - 16 `categoryColors` light/dark pairs;
  - `space` (4 to 44), `radius` (8, 12, 16, pill);
  - `fonts` and the `type` scale (`total`, `largeTitle`, `title`, `headline`, `body`, `bodyStrong`,
    `sub`, `caption`, `button`);
  - `TARGET`: 44 on iOS and the web, 48 on Android.
- **`useTheme()`** follows the system colour scheme and returns `{ c, scheme }`.
- **`useCategoryColor(icon)`** returns the hue and its disc tint: 12% alpha in light, 18% in dark.
- **Text** goes through `T` (`components/text.tsx`), which applies a `variant`, a `tone` and
  optional tabular figures (`numeric`).
- The design rules behind these tokens are in [DESIGN.md](../DESIGN.md). Light and dark are
  designed as pairs. In dark mode, for example, the primary button becomes periwinkle with navy text,
  because a dark indigo button would disappear on the navy ground.

### 9.2 Charts

- **`PaceChart`** (`components/pace-chart.tsx`) is drawn with `react-native-svg`. This month is a
  monotone cubic line (no overshoot below zero or past the real values) with a gradient fill. Last
  month is a dashed ghost line. A mint dot marks today. It sits on `BrandGradient`, a static
  navy → royal → electric SVG gradient with an icy glow, shared with the onboarding slides. The whole chart has one
  `accessibilityLabel` that states the numbers in words.
- **Reports month-by-month bars** are plain `View`s sized as a percentage of the largest month. Each
  bar is a button that selects its month.
- **Category colour never goes into a chart** (the Disc-Only Rule). Ranked rows carry the comparison.

### 9.3 Platform differences

| Area | iOS | Android | Web |
|---|---|---|---|
| Tab bar | Floating `expo-router/ui` dock, Tabler icons | Same | Same |
| Sheets | `formSheet` with grabber | `formSheet` | Full-screen `card` |
| Touch target | 44 pt | 48 dp | 44 px |
| Announcements | `announceForAccessibility` (no live regions) | Live regions | `aria-live`, and focus moves to the field |
| Focus ring | System | System | `theme/web-focus.ts` adds a `:focus-visible` outline (WCAG 2.4.7) |
| Switch colours | `trackColor` | `trackColor` | Also needs `activeTrackColor`/`activeThumbColor` |
| Toast offset | `useTabBarClearance()` | Same | Same |
| Back | Swipe | Predictive back (`predictiveBackGestureEnabled`) | Browser back |

Tab screens stay mounted, so a plain `<StatusBar>` would leave whichever tab mounted last in charge.
`FocusStatusBar` renders the status bar only for the focused screen. Home uses light content on
indigo, and the other tabs follow the colour scheme.

### 9.4 Accessibility architecture

- **Errors:** `announceError(message, ref)` (`components/announce.ts`) speaks the first error and
  moves accessibility focus to its field. Inline errors also sit in polite live regions.
- **Toasts:** announced on every platform. One with an action stays 20 s when a screen reader is on,
  so Undo can be reached.
- **Controls with roles:**
  - currency and category pickers are `radiogroup`s of `radio`s;
  - the date stepper is `adjustable`, with increment and decrement actions;
  - section headers have the `header` role.
- **Autofocus is skipped with a screen reader on.** The add sheet only opens the keyboard when no
  screen reader is running, so screen-reader users hear the heading first.
- **Search results** are announced as a count, debounced through `useDeferredValue` plus a 600 ms
  timer.
- **Text scaling** follows the OS. `maxFontSizeMultiplier` caps it at 2× for all text and fields,
  1.6× for category tile names and 1.5× for the amount input. Totals shrink to fit, down to 60%.
- **Motion:** Reanimated animations use `ReduceMotion.System`.
- **Contrast:** `npm run check:contrast` checks 180 pairs in light and dark (text at 4.5:1,
  non-text at 3:1).

### 9.5 Adding from the dock

The raised **+** in the middle of the dock opens `/expense/new` from any tab; Quick add on Home
opens it with a category chosen. There is no separate floating Add button. Tab screens pad their
bottom by `useTabBarClearance()` (the dock, its raised button and the safe area), so nothing hides
behind the dock.

---

## 10. Phase 2 target architecture

> **Status:** part A (on the device) is **built**: §7 describes it. §10.3 is done. Part B (Supabase,
> auth, sync, server-side account deletion) is still planned; the server schema and sync protocol
> below are **proposed**, adapting PLAN.md's sync design to Track B. Review them before building.

### 10.1 Goals and constraints

From PLAN.md §5.6 and the MVP definition:

- **Offline first.** Logging never waits for the network. Writes queue on the phone and sync later
  without duplicates.
- **Instant month screen.** It renders from local data, then refreshes.
- **The server is the source of truth.** Conflicts resolve as last edit wins (one user, few
  devices). A delete always wins.
- **The offline test must pass:** add 5 expenses offline, kill the app, go online, and exactly 5 sync.
- **The deletion test must pass:** the data is gone on the server.

### 10.2 Shape

```mermaid
flowchart TB
  subgraph Phone
    UI["Screens<br/>(unchanged hooks)"] --> Repo["Repository<br/>async API"]
    Repo --> SQL[("expo-sqlite<br/>expenses · categories · settings<br/>outbox · meta")]
    Sync["Sync engine<br/>push outbox → pull since cursor"] --> SQL
    Net["NetInfo · AppState"] --> Sync
    AuthC["Auth client<br/>tokens in SecureStore"] --> Sync
  end
  Sync -- "push: RPC / upsert" --> PG[("Supabase Postgres<br/>RLS: user_id = auth.uid()")]
  Sync -- "pull: revision > cursor" --> PG
  AuthC --> SA["Supabase Auth"]
  UI -- "delete account" --> EF["Edge Function<br/>delete-account"]
```

**SQLite is the only thing screens read from.** Network responses are written into SQLite, never
shown directly, so there are never two caches that disagree (PLAN.md §7.1).

### 10.3 Store API changes (from `tasks/todo.md`), built in part A

All of these are built (§7). Two details differ from the plan: reads are synchronous SQLite queries
rather than an async repository (writes are async), and CSV import is not built yet, so
`toDayKey()` checks rows on the way *into* the database.

- **Mutators become async.** They return promises. Toasts and navigation happen after the local
  write resolves.
- **The store exposes `ready` and `error`.** Screens wait for `ready` and show an error state on
  `error`.
- **Soft deletes with tombstones** (`deletedAt`). Undo restores with a newer `updatedAt` (and a new
  `version`), so a sync can't bring the delete back.
- **Aggregates move to SQL** (month totals, by category, by day), with an index on `day`, instead of
  JavaScript over every row. `summarise()` stays the reference implementation. A check should
  confirm that the SQL and JavaScript give the same totals.
- **Rows read from SQLite or CSV are validated** through `toDayKey()` and `toMonthKey()` (branded
  types) before they enter the domain.
- **Account deletion and auth** get real error paths.

The hook names (`useStore`, `useActions`, `useSummary`, `useMonth`) stay the same, so screens change
only where they now await a result.

### 10.4 Proposed server schema (Supabase)

```sql
-- Proposed. Money is bigint minor units; day is a calendar date (no time zone).
create table profiles (
  id               uuid primary key references auth.users on delete cascade,
  first_name       text not null check (char_length(first_name) between 1 and 60),
  currency         text not null default 'NGN' check (currency in ('NGN','USD')),
  reminder_on      boolean not null default true,
  reminder_time    time not null default '20:00',
  marketing_opt_in boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table categories (
  user_id         uuid not null references auth.users on delete cascade,
  id              text not null,                       -- slug for starters, UUID for custom
  name            text not null check (char_length(name) between 1 and 40),
  icon            text not null,
  budget          bigint check (budget > 0),
  budget_currency text check (budget_currency in ('NGN','USD')),
  built_in        boolean not null default false,
  version         int not null default 1,
  revision        bigint not null,                     -- set by trigger from a sequence
  deleted_at      timestamptz,
  primary key (user_id, id)
);

create table expenses (
  id          uuid primary key,                        -- client-generated; makes retries idempotent
  user_id     uuid not null references auth.users on delete cascade,
  amount      bigint not null check (amount > 0 and amount < 100000000000),
  currency    text not null check (currency in ('NGN','USD')),
  category_id text not null,
  day         date not null,
  note        text not null default '' check (char_length(note) <= 120),
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  version     int not null default 1,
  revision    bigint not null,
  deleted_at  timestamptz
);
create index on expenses (user_id, revision);
create index on expenses (user_id, day) where deleted_at is null;
```

- **RLS:** on every table, `using (user_id = auth.uid())` and `with check (user_id = auth.uid())`.
  Before launch, run a two-account test: account A must not be able to read or change account B's
  rows (PLAN.md §9).
- **`revision`** comes from one global sequence, assigned by a `before insert or update` trigger.
  **The server owns time.** Sync never trusts phone clocks, so a phone set to the wrong date can't
  skip or overwrite rows.
- **`day` is a `date`, never a `timestamptz`.** It is the user's local calendar day, exactly as the
  app's `DayKey`.

### 10.5 Proposed sync protocol

1. **Local write.** The app writes the row to SQLite and appends `{entity, op, id, payload,
   baseVersion}` to `outbox` in the same transaction. The UI updates from SQLite straight away.
2. **Coalesce before sending.**
   - Create then edit becomes one create.
   - Create then delete, before a sync, sends nothing.
   - Several edits become the last one.
3. **Push** whenever there is a network connection, the app comes to the foreground, or after a
   write (debounced). The app calls one RPC, for example `push_changes(jsonb)`, that upserts by
   `id`:
   - **Create** is idempotent: on a conflict with the same `id`, nothing changes.
   - **Edit** carries `baseVersion`. On a mismatch, the server copy wins and the user is told.
   - **Edit on a deleted row** is rejected (delete wins), and the app drops the edit.
4. **Pull:** `select … where revision > :cursor order by revision`, including tombstones. The
   app applies the rows to SQLite and stores the new cursor in `meta`.
5. **Old cursor.** If a cursor is older than the tombstone retention window, the server answers
   "full resync" and the app reloads everything.
6. **Auth during sync.** Only one token refresh runs at a time. Signing out with unsynced writes
   warns the user first. The local database is **per user** (one file per user id), so a second
   account never sees the first one's data.

### 10.6 Accounts

- **Supabase Auth** (email and password) handles sign up, sign in, password reset
  (`resetPasswordForEmail` with a deep link back to the app) and token refresh. Sessions are stored
  with `expo-secure-store`.
- **Account deletion** (required by Apple guideline 5.1.1(v) and by Google Play):
  1. The app calls the `delete-account` Edge Function with the user's JWT.
  2. The function, using the service role, deletes the `auth.users` row. Data is erased by
     `on delete cascade`.
  3. Only after a success does the app wipe its local database and sign out.
  4. On failure, the button resets and the screen says why.

  Google Play also needs a **web page for deletion requests** (PLAN.md §5.1, A5).

### 10.7 Other planned modules

| Feature | Approach |
|---|---|
| Daily reminder | `expo-notifications`: local, inexact scheduling (Android 14+ blocks exact alarms). Permission is asked when the user turns the reminder on. No server is involved. |
| Report as PDF | `expo-print` renders HTML built from `MonthSummary`; `expo-sharing` opens the share sheet. |
| CSV export | Built from SQLite; each row carries its own currency (fixes the web's bug B8); shared through the share sheet. |
| Crash reporting | Sentry, with no PII and no amounts. |
| Force update | A minimum supported app version, checked on launch (PLAN.md §7.2 `app/config`). |

### 10.8 Environments and release (planned)

- **EAS profiles:**
  - `development`: a dev client, needed once a native module outside Expo Go is added;
  - `preview`: TestFlight and Play internal testing, against a **staging** Supabase project with no
    real users;
  - `production`.
- **Over-the-air updates** use a `runtimeVersion` policy, so an update only reaches compatible builds.
  OTA is for fixes only. Apple guideline 2.5.2 doesn't allow new features over the air.
- **Android:** `allowBackup` excludes the database and tokens.
- **Still needed in `app.json`:** `ios.bundleIdentifier` and `android.package`. These wait on
  decision D3 (PLAN.md recommends `com.titofinance.expenses`).

---

## 11. Quality gates

| Gate | Command | Guards |
|---|---|---|
| Types | `npm run typecheck` | Strict TS, typed routes |
| Lint | `npm run lint` | Expo ESLint rules, hooks rules |
| Domain | `npm run check:dates` | Local-calendar month/day maths in `Africa/Lagos`; DST; money format and parse; summaries (unknown category, malformed day, other currency) |
| Contrast | `npm run check:contrast` | WCAG AA for 180 text and non-text pairs (header text against the worst point of the sampled brand gradient, and on glass cards over it) in light and dark |
| Dependencies | `npx expo-doctor` | SDK 58 compatibility |
| Visual | Web build at 390 × 844, light and dark | Layout and states |
| Devices | Expo Go on a real iPhone and Android phone | Safe areas, keyboard, VoiceOver/TalkBack, 200% text (checklist in `tasks/todo.md`) |

`scripts/check-dates.ts` runs the real domain source in plain Node:

- Node strips the TypeScript types itself.
- `scripts/ts-resolve.mjs` adds the `.ts` extension to relative imports.
- The script sets `TZ=Africa/Lagos` before anything reads the clock.

So nothing is compiled or mocked.

---

## 12. Architecture decisions

| # | Decision | Why | Alternatives rejected |
|---|---|---|---|
| AD1 | **Native app with Expo**, not a wrapped website | Offline use, notifications, store requirements, native feel | WebView wrapper of the web tracker (PLAN.md §2) |
| AD2 | **Track B: own Supabase backend**, fresh start for users | No access to `aangoo-server`; Supabase provides auth, reset, refresh and RLS | Extending `aangoo-server` (Track A) |
| AD3 | **Integer minor units plus a currency on every expense** | Fixes bug B2 (currency relabelling); no float errors | Floats; one global display currency |
| AD4 | **Local calendar string keys** (`DayKey`, `MonthKey`) and an in-house `dates.ts` | Fixes bugs B1 and B3; string compare = date compare; small and tested in Lagos time | `Date` objects throughout; `toISOString()`; date-fns, which PLAN.md §7.1 suggested. Not needed: the module is ~90 lines and covered by `check:dates`. |
| AD5 | **Hand-rolled `formatMoney`** instead of `Intl.NumberFormat` | Identical output on Hermes and the web | `Intl` (output differs by engine and locale data) |
| AD6 | **Client-generated UUIDs** for expenses | Offline creation without server ids; idempotent retries | Server integer ids (as on the web) |
| AD7 | **Charts with `react-native-svg`**, not Victory Native/Skia | Two simple charts; Skia needs extra WebAssembly setup for the web build | Victory Native (Skia), suggested in PLAN.md §7.1 |
| AD8 | **Context + reducer** for phase-1 state, behind hooks (replaced in phase 2 part A by AD13) | Smallest thing that works for phase 1; the hook boundary kept the phase-2 swap local: screens changed only to await writes and to use the new read hooks | Redux, Zustand, TanStack Query in phase 1 |
| AD9 | **`Stack.Protected`** for auth gating | No back gesture into signed-out data | Redirects in `useEffect` |
| AD10 | **Floating finance dock with `expo-router/ui`** on every platform (redesign, 2026-11-24) | The design calls for a custom dark bar, which the system tab bar can't do; one layout for all platforms | The system tab bar (`NativeTabs`), used until the redesign |
| AD11 | **Redesign palette** (navy, royal, electric, icy, one mint pop) and **Outfit** | The redesign brief; Outfit's `tnum` gives tabular amounts | The earlier Tito indigo + Manrope/Fraunces look; the web tracker's monospace amounts |
| AD12 | **SQLite as the only read source in phase 2**, with an outbox | Offline first, instant screens, one cache | Reading straight from the network; two caches |
| AD13 | **Synchronous reads, async writes** over expo-sqlite, re-queried on a data version (part A, 2026-11-26) | Indexed month queries take well under a millisecond, so screens render from SQLite with no loading state or flash, and the hooks stay synchronous; writes run off the JS thread on phones and in transactions | Async read hooks with loading states; mirroring every expense in React state |
| AD14 | **Totals in SQL as GROUP BY rows**, assembled by a pure `summariseGroups()` | The cost depends on one month, not the whole history; the assembly rules stay testable in plain TypeScript and are checked against `summarise()` | One SQL query per figure; keeping `summarise()` over every expense |
| AD15 | **Node's built-in SQLite in Jest** (`jest.sqlite.js`) | Tests run the real schema, migrations and SQL, including restarting the app, without a device | Mocking the repository; an in-memory fake of SQL |

---

## 13. Known limitations and open questions

**Current limitations (by design, until part B)**

- Data is saved on the device only. One database holds everything, whoever signs in; part B
  makes it one file per user.
- The web build needs the two cross-origin isolation headers from whatever hosts it (§7.1).
  Without them it shows the "didn't open" screen.
- The outbox fills up and is never sent or trimmed until part B.
- Auth, reset, delete account, PDF, CSV, the reminder and the privacy policy are UI stubs (see the
  README).
- Forms use local state and inline checks. PLAN.md §7.1 suggests react-hook-form + Zod. Decide
  before phase 2 whether the extra forms justify it.
- The tab bar and toast offsets come from `useTabBarClearance()`; confirm them on devices.
- Tests run SQLite through Node, not a phone; check on real devices (`tasks/todo.md`).

**Open questions**

| # | Question | Owner |
|---|---|---|
| Q1 | Does Mr Tito approve the phase-1 screens? This gates phase 2. | Tito Finance |
| Q2 | App name and bundle id (D3) | Tito Finance + Koret |
| Q3 | Whose Apple and Google developer accounts (D2)? An organisation account needs a D-U-N-S number. | Tito Finance |
| Q4 | Supabase region and plan; staging project | Koret |
| Q5 | Is the sync protocol in §10.5 confirmed, including the tombstone retention window? | Koret |
| Q6 | Which currencies at launch? | Tito Finance |
| Q7 | Analytics at launch (PostHog anonymous, or none)? | Tito Finance + Koret |

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **Minor units** | The smallest unit of a currency: kobo for NGN, cents for USD. ₦1 = 100 kobo. |
| **DayKey / MonthKey** | `"YYYY-MM-DD"` / `"YYYY-MM"` strings in the user's local calendar |
| **Main currency** | The currency totals are shown in (Settings → Money) |
| **Pace line** | Home's chart: cumulative spending this month vs last month to the same day |
| **Outbox** | (Phase 2) A local queue of writes waiting to be sent to the server |
| **Tombstone** | (Phase 2) A soft-deleted row kept so other devices learn about the delete |
| **Revision / cursor** | (Phase 2) A server-issued, ever-increasing change number, and the last one a device has pulled |
| **Sheet** | A modal screen that slides up (native form sheet; a card on the web) |
| **Track B** | Decision D1: Koret builds and owns a new backend rather than extending `aangoo-server` |
| **B1–B9** | Defects found in the old web tracker (PLAN.md §1.6) |
