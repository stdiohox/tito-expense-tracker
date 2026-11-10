# Tito Expenses

Phone app (iOS and Android) replacing the web tracker at expenses.titofinance.com, for
Tito Finance. Built by Koret. Plan, PRD and MVP: `proposals/tito-expense-app/PLAN.md` in the
Koret Tech repo. Product brief: [PRODUCT.md](PRODUCT.md). Build checklist: [tasks/todo.md](tasks/todo.md).

**Status: phase 1 — screens on sample data.** Everything runs in memory with synthetic
expenses. No accounts, sync or backend yet (phase 2: expo-sqlite + Supabase, owned by Koret).

## Stack

Expo SDK 58 · React Native 0.88 · TypeScript · Expo Router (system tab bar on iOS and Android)
· react-native-svg (charts) · Tabler icons · Manrope + Fraunces. Package manager: **npm**.

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go on a phone
npx expo start --web    # browser preview at phone width
```

## Checks

```bash
npx tsc --noEmit
npx eslint src
npm run check:dates      # month/day maths in Africa/Lagos (the web tracker's bugs B1–B3)
npm run check:contrast   # WCAG AA for every colour pair in src/theme/tokens.ts
npx expo-doctor
```

## Layout

```
src/app/            routes: (tabs)/ home, expenses, reports, settings; expense/, category/, auth
src/components/     shared UI (rows, buttons, pace chart, toast, form)
src/data/           store (phase 1: in memory) and sample data
src/domain/         dates (local calendar), money (integer minor units), summaries
src/theme/          colour tokens (light + dark), type scale, spacing
```

## Rules that matter

- Money is stored as integer minor units (kobo, cents) with a currency on every expense.
  Changing the main currency never relabels saved amounts.
- Months and "today" use the device's local calendar. Never build dates with `toISOString()`.
- One primary action per screen; budgets inform, never alarm (clay, not red).
