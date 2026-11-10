# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Expo SDK 58 (React Native 0.88, TypeScript, Expo Router), one codebase for iOS and Android, with a web build from the same code. Backend: a new Supabase project owned by Koret (Postgres, Auth, Row-Level Security). Decided in the Koret plan (`proposals/tito-expense-app/PLAN.md` in the Koret Tech repo, decision D1 = Track B, 2026-11-09).

One look on both phones (confirmed 2026-11-09), using each OS's own pickers, sheets, Back gesture and safe areas where users expect them.

## Users

Mr Tito's audience at Tito Finance: everyday earners in Nigeria who want to know where their money goes. They log spending on their phone, often right after paying, sometimes with poor or no data connection. Amounts are mostly in naira; some users think in US dollars.

## Product Purpose

Replace the web tracker at expenses.titofinance.com with a phone app that makes logging a payment take seconds and makes the month's spending obvious at a glance. Success: people log daily, see their month by category, stay within the budgets they set, and keep using it past the first week.

## Positioning

A calm, private place to see your month, from a personal-finance educator people already follow. It is not a bank and moves no money: it records what you spent and helps you notice patterns.

## Operating Context

- Logging happens one-handed, just after a purchase, in shops, markets, transport and at home.
- Reviewing happens at the end of the day or the month.
- Works offline first; syncs when a connection returns.
- A daily reminder nudges people who forget to log.

## Capabilities and Constraints

- Add, edit and delete expenses (amount, category, date, note), with undo on delete.
- Twelve starter categories carried over from the web tracker (Rent & Housing, Food & Groceries, Transportation, Bills & Utilities, Airtime & Data, Family Support, Faith & Giving, Personal Care, Health, Entertainment, Shopping, Other), plus custom categories with an optional monthly budget.
- Month view with totals by category, a daily trend, and reports shared as PDF.
- Accounts: sign up, sign in, password reset, account deletion in the app (store requirement).
- Each expense stores its own currency. Changing the display currency never relabels saved amounts.
- Months and "today" follow the user's local time zone (Africa/Lagos for most users).
- No bank linking, no money movement, no investment features.
- Existing web-tracker users start fresh unless the Aangoo backend's owner provides an export.

## Brand Commitments

- Tito Finance brand: indigo `#272c77` as the primary colour, with the web tracker's clay `#C75D3F` and gold `#C89B3C` as supporting colours. Fonts on the web tracker: Fraunces, Manrope, JetBrains Mono.
- Feel: calm, clear, encouraging. Never judgemental about spending.
- Layout reference chosen by the client: Wealthfront iOS (large totals, grouped lists, one accent, one primary button per screen). Take its structure and calm, not its colours, icons or copy.
- Must not look like: a cluttered bank app, a cartoonish or gamified app, a dark crypto-trader app, or a spreadsheet.

## Evidence on Hand

- Web tracker source as shipped (scraped for analysis, not owned): categories, copy and flows.
- No testimonials, user numbers or app-store ratings yet. Do not invent any.

## Product Principles

1. Logging an expense is the fastest thing in the app.
2. The month's total and where it went are visible without a tap.
3. Encourage, never scold: budgets inform, they do not alarm.
4. Offline is normal, not an error.
5. The user's data is theirs: export it, delete it, no surprises.

## Accessibility & Inclusion

WCAG 2.2 AA contrast for all text, including category colours used as text. Touch targets at least 44 pt (iOS) and 48 dp (Android). Text follows the system font size. Reduce Motion is honoured. Amounts are never conveyed by colour alone.
