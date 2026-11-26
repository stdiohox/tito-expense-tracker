# TET: project status

Branch `feature/nike-polish` (from `feature/nike-redesign`), 25 November 2026.

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
- `src/data/`: the app's data store (in memory for now), the selected month and the totals.
- `src/domain/`: the core rules for money, dates, categories and month summaries.
- `src/theme/`: colours, fonts, spacing and light/dark handling.
- `scripts/`: automatic checks for dates and money, and for colour contrast.
- `docs/`: architecture notes and this file. `DESIGN.md` is the design system and `PRODUCT.md` is the client brief.

### Tech stack

- Expo SDK 58, React Native 0.88, React 19 and TypeScript.
- Expo Router for navigation.
- react-native-svg for the gradient and charts, and Reanimated for motion.
- Outfit for all text, and Tabler icons.
- Data lives in memory for now. Phase 2 adds SQLite on the phone and Supabase online.

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

## 4. What works fully vs. what is a placeholder

"Works" means it works on the device. Until Phase 2, everything is lost when the app restarts.

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
| Saving data between launches | Placeholder: in memory only |
| Real accounts (sign up, sign in) | Placeholder: no server yet |
| Reset password | Placeholder: no email is sent |
| Delete account | Placeholder: clears this device only |
| Share report as PDF | Placeholder: shows "arrives in the next build" |
| Export as CSV | Placeholder: shows "arrives in the next build" |
| Daily reminder | Placeholder: the switch saves, but no notification is sent |
| Privacy policy | Placeholder: not published yet |
| App icon | Placeholder |

## 5. What's left to build

**Phase 2**
- **SQLite storage:** save data on the phone so it survives restarts. Totals are worked out in the database.
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

What's needed before launch:
- **Crash reporting** (for example Sentry), so crashes show up with enough detail to fix.
- **Tests:** automatic tests for the money, date and budget rules, plus a few end-to-end runs (sign up, add, edit, delete, sync).
- **CI:** every push runs typecheck, lint, the checks and tests, and builds with EAS.
- **Supabase setup:** a paid plan with backups, every table locked to its owner, indexes on dates and users, rate limits on login, and syncing in small batches. Saving on the phone first keeps server load low.
- **Staged releases:** TestFlight and Play internal testing first, then a gradual rollout. Over-the-air updates go out in channels so a bad update can be rolled back.
- **Store basics:** a privacy policy, in-app account deletion (both stores require it), and the final icon.

## 8. Recommended next 5 steps

1. Test `feature/nike-polish` and `feature/nike-currencies` in Expo Go on an iPhone and an Android phone (sheet drag and keyboard, onboarding motion, Reduce Motion, VoiceOver/TalkBack on the new charts), then push both branches, open the pull requests and get client sign-off.
2. Set up Supabase: schema, access rules, and real sign-up (with first and last name), sign-in, reset and delete.
3. Add SQLite storage with the sync queue, and make the store wait for each save.
4. Add crash reporting, tests and CI.
5. Finish the app icon, CSV and PDF export and the daily reminder, then send the first TestFlight and Play internal test builds.
