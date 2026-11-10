---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: []
---

# App screens (phase 1)

Scope: the phone app's core screens: home, add/edit expense, category detail, all expenses, reports, settings, auth. Visitor mode: Operate.

Audience and job: everyday Nigerian earners logging a payment in seconds and checking where the month went. Constraints: one look on iOS and Android with native controls, offline-first, light and dark.

## Direction contract

THESIS: Your month as a pace, not a ledger. Home leads with how this month's spending is tracking against last month at the same day, so the first read is "am I on course", not a table of transactions. Refuses the bank-app dashboard of tiles, promos and a transaction list up top.

OWN-WORLD: Tito indigo `#272c77` drenches the home header and the auth welcome; everything below sits on a cool near-white (light) or deep indigo-black (dark) with white or raised surfaces. Gold `#C89B3C` marks "today" only. Clay `#C75D3F` marks a budget passed, never red alarm. Category colours appear as small tinted icon discs. Manrope for all UI with tabular figures; Fraunces only for the big totals and large titles. Grouped lists with hairline dividers, round tinted icon discs, amounts right-aligned. One full-width primary button per task screen.

STORY: Open the app, see "₦184,500 spent in November" and a line showing you are ₦12,400 under last month's pace. Scroll to see where it went by category. Tap + to log the next payment in three taps. Tap a category to see its budget and entries.

FIRST VIEWPORT: Indigo header filling the top ~45%: month switcher (‹ November ›, year shown only for past years) top-left, nothing top-right (Settings is a tab, so a second entry point was dropped); the total in Fraunces ~44pt white; one line under it in light indigo ("₦12,400 less than this time last month"); the pace chart (this month solid white line with soft fill, last month dashed faint line, gold dot at today, three axis labels). Below on the light surface: "Where it went" heading with month total right, then category rows. Floating "+ Add expense" pill bottom-right above the tab bar, collapsing to a round "+" once the list scrolls and hiding while scrolling down (back on scroll up), so rows can always be read from under it; tab bar: Home, Expenses, Reports, Settings.

FORM: Wealthfront-iOS structure translated into Tito's brand; position 1 of 1. The client pinned it on 2026-11-09 by sending the Mobbin Wealthfront iOS link and 20 screen flows in reply to a request for design references; concept-seed was rolled on 2026-11-10 for the record, and per new-work the client's pinned direction beats the roll's assignment. seed:97532d229dace5c9

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature move: the pace line on home (this month vs last month to the same day).
Category colour stays in small tinted discs only; Reports uses the ranked rows, not a multi-colour bar.
Unresolved: final app name and icon (D-decisions in PLAN.md).
