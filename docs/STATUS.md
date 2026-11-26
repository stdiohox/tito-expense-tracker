# TET: project status

Branch `feature/nike-storage` (from `main`), 26 November 2026.

## 1. What the app is

- TET (Tito Finance Expense Tracker) is a phone app for logging what you spend and seeing your month at a glance.
- It shows your month as a pace: how much you have spent so far compared with last month, where it went, and how your budgets are doing.
- It runs on iOS, Android and the web. It is built with Expo, so it can be tested in the Expo Go app without a full build.

## 2. What's in the codebase today

### Screens

**Signed out**
- **Welcome (onboarding):** three intro slides, each with a short animated illustration using sample numbers (an expense being logged, the month's pace line, budget bars and a donut). Skip, "01 / 03", then "Create an account" or "I already have an account". With Reduce Motion on, the illustrations stay still.
- **Sign up:** first name, last name, email and password (all required), then Setup.
- **Sign in:** email and password, then Home. Includes a "Forgot your password?" link.
- **Reset password:** asks for an email, then shows "Check your email" and "Back to sign in".

**Signed in**
- **Setup:** three steps after sign-up: your currencies (a main one and an optional second, from a list of twenty grouped by region, searchable by currency or by any country that uses it), how hands-on you want to be, and categories with up to four budgets. Every step can be skipped. It can be run again from Settings.
- **Home:** your initials avatar and greeting, month switcher and month total, a pace chart against last month, and a glass card for each of your currencies (tap one to see its expenses). Below that: Quick add (one tap per category), budgets (shown as soon as they are set, even at ₦0 spent), "Where it went" (top five categories) and the latest expenses.
- **Expenses:** every expense for the month in one currency (a toggle switches when you have two), grouped by day, with search. Deleting has Undo.
- **Add expense / Edit expense:** a bottom sheet over the page, about half the screen high: amount, currency (only your currencies) and category, with date and note below. Drag up for full height, drag down or ✕ to close. On phones it goes full height when the keyboard opens, so Save stays visible. Edit can also delete.
- **Reports:** one currency at a time (same toggle): the month total and comparison cards, a Day by day chart (tap a day to see its total against last month), a Budgets chart (spent against each budget, with "left" or "over" in words), the month by category, and a bar chart by month.
- **Category detail:** the total for one category, its budget and its expenses.
- **Categories and budgets / Edit category:** add, show, hide and rename categories, pick their icons, and set monthly budgets. Edit category opens in the same bottom sheet.
- **Settings:** your avatar, full name and email at the top, then account, main and second currency, categories, Appearance (System, Light or Dark), daily reminder, export, privacy policy, sign out and delete account.
- **Delete account:** you type DELETE to confirm. "Keep my account" goes back.

### Main folders

- `src/app/`: the screens. Every file is a screen; `_layout.tsx` files set up navigation.
- `src/components/`: shared building blocks such as buttons, fields, panels, glass cards, charts, the toast and the hero card.
- `src/data/`: the app's data store and the hooks screens read through, the selected month and the totals.
- `src/db/`: the SQLite database on the phone: migrations, reads and writes, the outbox.
- `src/domain/`: the core rules for money, dates, categories and month summaries.
- `src/theme/`: colours, fonts, spacing and light/dark handling.
- `scripts/`: automatic checks for dates and money, and for colour contrast.
- `docs/`: architecture notes and this file. `DESIGN.md` is the design system and `PRODUCT.md` is the client brief.

### Tech stack

- Expo SDK 58, React Native 0.88, React 19 and TypeScript.
- Expo Router for navigation.
- react-native-svg for the gradient and charts, and Reanimated for motion.
- Outfit for all text, and Tabler icons.
- FlashList for the long lists (Expenses, Categories).
- Sentry for crash reporting (off until a DSN is set; no personal data).
- Jest with jest-expo and React Native Testing Library; GitHub Actions for CI.
- expo-sqlite: data is saved on the phone (Phase 2 part A). Supabase online comes in part B.

## 3. What has changed since I joined

Everything after commit `3529e3d` (README and architecture docs).

**Audit fixes**
- `9b2df22` Settings shows the email of the account that signed in (M5).
- `d2dff90` Deleting the account resets settings and the starter categories (M4).
- `f424ad3` Add button shown on Reports and Settings (M7). Later reverted.
- `12cd024` Budget switch gets the web colour fix (M6).
- `4a8b7c2` Field borders and switch tracks reach 3:1 contrast (M2).
- `e11733d` "About the same" threshold depends on the currency (M1).
- `4922c9a` Every hard-coded colour moved into the theme (L1).
- `2b0fe09` Focus border on every text input (L5).
- `696c3fa` Text scaling capped at 2× on the remaining inputs (L6).
- `3e56eef` Form errors are announced and focus moves to the field (L7).
- `5754641` Welcome headline marked as a heading (L15).
- `0cf3409` No success vibration when an update fails (L12).
- `219b8b5` Reports uses the shared current month (L13).

**Add button revert**
- `4fd569f` Reverted M7, so the Add button is on Home and Expenses only.
- `ef0289b` Docs updated to match.
- `fc613e9` Merged pull request #1 (sign-in work) into main.

**Palette and gradient (first pass)**
- `4d6e36f` New navy, ivory, French blue, sky, gold and burgundy palette.
- `f32d75d` Navy to French blue gradient on the Home header and Welcome.
- `e3eadea` Gold crown on the selected month bar, and the Welcome wordmark.
- `4422ee5` Colour rules for that palette.
- `64dddde` Merged main into the theme branch.
- `3eb5adc` Fixed the gradient passing phone-only props to the web.

**Appearance setting**
- `29379ac` System, Light or Dark in Settings.

**Onboarding and setup**
- `7cb4f7e` Three intro slides on the brand gradient.
- `f217a44` Hidden categories and a setup mode setting.
- `77f9568` Three-step setup after sign-up, plus Redo setup.

**Blue redesign**
- `5b36608` Outfit font for all text.
- `2e7d4e7` Navy, royal, electric, icy and mint palette with a layered gradient.
- `3f78f16` Floating tab bar, panels and glass cards.
- `f3e731c` Home: gradient header, glass currency cards, Quick add and budget grid.
- `33a664c` Mint check on success toasts.
- `6d7c130` Expenses: stat cards and one panel per day.
- `6bb94fb` Reports: total panel, comparison cards and sections in panels.
- `0692b5e` Settings: rounder group panels and 16px margins.
- `29e7853` Category: hero panel, stat cards, and a budget panel with a % badge.
- `3c2b328` Design system, rules and architecture docs for the redesign.
- `386b44d` Tab bar docked to the bottom edge.
- `a1e1da5` Home: dark brand scene in both modes with frosted glass cards.
- `1c0900e`, `e042727` Docs for the docked tab bar and glass.
- `2667252` The same hero on every tab, brighter, and Home follows light and dark.
- `3520548` Search icon and placeholder lined up on Expenses.
- `09d49c8` Docs for the shared hero.
- `b2b089b` Floating dock with a raised Add expense button in the middle.
- `619585e` Docs for the dock.
- `0eb1650` White frosted-glass dock at 88% width.
- `9823613` Docs for the glass dock.

**TET name**
- `4f55a60` App named TET, Tito Finance Expense Tracker.

**Hero card**
- `37082d5` The hero is a rounded card, not a full-width band.

**Demo data removal**
- `269e87f` All demo data removed. The app starts empty and signed out.

**Motion**
- `8e16b3a` Calm motion: sections fade in, totals count up and budget bars grow.
- `f70ebc3` Docs for the hero card, motion and wordmark.

**Tidy-up**
- `4651e91` desktop.ini ignored; todo list and a code comment updated to the new palette and font.
- `eae8793` Todo list says the data starts empty.

**Flow fix**
- `7090741` Signed out, the app opens on the onboarding slides, not Reset password, and Reset's "Back to sign in" no longer loops.

**Polish pass** (branch `feature/nike-polish`)
- `6ac37bc` Sign-up asks for first and last name; Settings shows the full name.
- `8d3e944` Round initials avatar: small next to the Home greeting, large at the top of Settings.
- `970a864` Budgets show on Home as soon as they are set, at ₦0 spent.
- `0757b60` Setup allows up to four budgets (was two).
- `fc8aaa8` Add expense is a half-height bottom sheet you can drag up or down; ✕ now closes it (also Edit expense and Edit category).
- `bf1d8f9` Reports: a Day by day chart and a Budgets chart.
- `19fffe5` Onboarding slides have live illustrations with sample numbers.
- `4377254` Web: sections no longer overlap after the reveal animation.
- `2e33c2c` Expenses: the search icon lines up with the placeholder.

**Currencies** (branch `feature/nike-currencies`)
- `f23e707` Sixteen currencies with symbols, flags and the right decimals (none for the yen and the CFA franc).
- `ca00fc5` Setup and Settings: pick a main currency and an optional second from a searchable list.
- `ab9c916` Each currency tracked on its own: a Home card each, a toggle on Expenses and Reports, budgets in their own currency, and a removed currency's expenses kept.
- Final list of twenty currencies (adds XAF, MAD, UGX and TZS), grouped by region in the picker, searchable by every country that uses each one; a currency no longer on the list keeps working.
- `0df279c` Dev server: Metro opens at most 64 cache files at once, which stops the EMFILE crash on Windows.

**Reliability** (branch `feature/nike-reliability`)
- `724b883` docs/SCALE-PLAN.md: how the app stays stable from 10,000 to 200,000 users, with a 99.5% crash-free target.
- `1076ea0` No white screens: every screen has a calm "Something went wrong" screen with Try again and Go home; charts and animations fail on their own; unhandled errors are logged.
- `1d54423` Crash reporting with Sentry, off until a DSN is set, with amounts, notes, names and emails stripped.
- `9228268`, `0f0d0ea` 122 automatic tests: money in all 20 currencies, Lagos dates, summaries, budgets and pace, plus the main journeys run through the real app.
- `bafc038` Long lists use FlashList; a development-only button loads 10,000 test expenses; the slow spots found with it are fixed.
- `7be1096` GitHub Actions runs every check, the tests and a web build on each pull request and push to main.

**On-device storage, Phase 2 part A** (branch `feature/nike-storage`)
- `525c7c3` SQLite database (expo-sqlite): expenses, categories, settings and an outbox, each with id, user_id, created/updated/deleted times; indexes on day, category and currency; versioned migrations that never lose data. Web build set up for it (headers and the .wasm file).
- `18c8ef6` The store runs on SQLite behind the same hooks. Saving waits for the write before the toast; if it fails, the sheet stays open and says so. A calm "Your expenses didn't open" screen with Try again if the database can't open.
- `049aa36` Delete keeps a hidden tombstone; Undo brings it back newer than the delete, so a future sync can't undo it. Every change is recorded in the outbox.
- `f532c75` Totals by month, category, day and currency are added up in SQL; Reports' history is one query. An extra index on currency and day. Timings in docs/SCALE-PLAN.md §8.
- `5c8a5b0` Name, email, currencies, appearance, budgets, hidden categories, sign-in and setup progress survive restarts. Sign out keeps the data; Delete account wipes it.
- Tests for the database and for closing and reopening the app; docs updated.

## 4. What works fully vs. what is a placeholder

"Works" means it works on the device. Data is saved on the device and survives restarts; nothing is sent online yet.

| Feature | Status |
|---|---|
| Onboarding slides, sign-up → setup → Home, sign-in → Home | Works (any email and password are accepted) |
| First and last name, initials avatar | Works |
| Add, edit and delete expenses, with Undo, in a half-height sheet | Works (tested on web; check dragging and the keyboard on real phones) |
| Home, Expenses (with search), Reports, Category detail | Works |
| Categories, hiding categories and monthly budgets (up to four in setup) | Works |
| Month switcher, pace chart, budget bars | Works |
| Reports: Day by day and Budgets charts | Works |
| Onboarding illustrations (sample numbers only) | Works |
| Appearance (System, Light, Dark) | Works |
| Twenty currencies (by region, searchable by country); a main and an optional second, each tracked separately, never converted | Works (tested with the date and money checks; check on real phones) |
| Budgets in their own currency, picked per budget | Works |
| Error screens instead of white screens; charts and animations fail on their own | Works (tested) |
| Crash reporting (Sentry) | Ready; off until you add a Sentry DSN |
| Automatic tests (`npm test`) and CI on GitHub | Works; CI runs from the first pull request |
| Smooth with 10,000 expenses | Works in tests (`npm run perf`); check on a real phone |
| Saving data between launches (expenses, categories, budgets, settings, sign-in, setup progress) | Works (SQLite; tested by closing and reopening the app in the flow tests; check on real phones) |
| Recording changes for sync (outbox) | Works; nothing is sent until Supabase is set up |
| Real accounts (sign up, sign in) | Placeholder: no server yet |
| Reset password | Placeholder: no email is sent |
| Delete account | Placeholder: wipes this device only (no server yet) |
| Share report as PDF | Placeholder: shows "arrives in the next build" |
| Export as CSV | Placeholder: shows "arrives in the next build" |
| Daily reminder | Placeholder: the switch saves, but no notification is sent |
| Privacy policy | Placeholder: not published yet |
| App icon | Placeholder |

## 5. What's left to build

**Phase 2**
- ~~**SQLite storage:** save data on the phone so it survives restarts. Totals are worked out in the database.~~ Done on `feature/nike-storage`.
- **Supabase login and sync:** real accounts, and a sync queue that sends changes when the phone is online. Every table is locked to its owner.
- **Real password reset:** Supabase sends the email and the app handles the link.
- **Account deletion:** a server function deletes the account and all its data, and shows an error if that fails.
- **PDF and CSV export:** share a month report as a PDF, and export expenses as a spreadsheet.
- **Daily reminder notifications:** a local notification at the chosen time if nothing was logged that day.

**Also**
- **App icon:** final TET icon and splash screen.
- **Real-phone testing:** work through the checklist in `tasks/todo.md` on iOS and Android: header and dock placement, the keyboard, VoiceOver and TalkBack, 200% text, and glass cards.
- **PRODUCT.md:** update it to the new look once the client signs off on the redesign.

## 6. Features I plan to add

In suggested order:

1. **Multi-currency:** done on `feature/nike-currencies` (twenty currencies, a main and a second, never converted). Next: more than two at once if users ask. *Works in Expo Go.*
2. **Stronger budget tracking:** alerts when you're close, weekly pace, and budgets that carry over. *Works in Expo Go.*
3. **Recurring expenses:** rent and subscriptions that add themselves each month. *Works in Expo Go.* The rules are best kept on the server so they don't add twice across phones.
4. **Face ID / fingerprint lock:** lock the app on open. *Can be tried in Expo Go; release needs a development build* (for the Face ID permission text).
5. **Voice entry:** say "spent 5k on fuel" and it fills the form. *Needs a development build* for speech recognition. Reading the sentence can happen on the phone.
6. **Home-screen quick add:** a widget or icon shortcut that opens Add expense. *Needs a development build* and native widget code for iOS and Android.
7. **Receipt scan:** take a photo and fill the amount and shop. *The camera works in Expo Go; reading the receipt needs a server.*
8. **AI spending insights:** short, encouraging notes such as "Food is lower than last month, nice." *Needs a server* (keeps the AI key off the phone) and a few months of real data, so it comes last.

## 7. Scale and reliability (10,000–500,000 users)

The full plan is in `docs/SCALE-PLAN.md`. Already done:
- **Crash reporting:** Sentry is installed and wired to the error screens; it needs a DSN to switch on.
- **Tests:** 204 automatic tests (`npm test`), including the main journeys, closing and reopening the app, and the database (migrations, soft delete and Undo, the outbox, SQL totals in all 20 currencies); sync tests come with part B.
- **CI:** GitHub Actions runs every check, the tests and a web build on each pull request.
- **Performance:** checked with 10,000 expenses (`npm run perf`); totals now come from SQL (docs/SCALE-PLAN.md §8).

Still needed before launch:
- **Supabase setup:** a paid plan with backups, every table locked to its owner, indexes on dates and users, rate limits on login, and syncing in small batches. Saving on the phone first keeps server load low.
- **Staged releases:** TestFlight and Play internal testing first, then a gradual rollout. Over-the-air updates go out in channels so a bad update can be rolled back.
- **Store basics:** a privacy policy, in-app account deletion (both stores require it), and the final icon.

## 8. Recommended next 5 steps

1. Merge `feature/nike-reliability` once CI passes on its pull request, turn on branch protection for `main`, and connect Sentry (docs/SCALE-PLAN.md §7). Test in Expo Go on an iPhone and an Android phone (sheet drag and keyboard, onboarding motion, Reduce Motion, VoiceOver/TalkBack on the new charts), then push both branches, open the pull requests and get client sign-off.
2. Review and merge `feature/nike-storage` (on-device storage). Check in Expo Go on a real iPhone and Android phone that expenses, settings and setup progress survive closing the app completely, and that the web build opens its data when served with the headers in README → Static web build.
3. Set up Supabase: schema, access rules, and real sign-up (with first and last name), sign-in, reset and delete. Then send the outbox and pull changes back (part B), with one local database per user.
4. Add the part B tests: offline sync (add 5 offline, reconnect, exactly 5 sync) and the two-account access test.
5. Finish the app icon, CSV and PDF export and the daily reminder, then send the first TestFlight and Play internal test builds.
