---
name: Tito Expense Tracker
description: A calm phone app for seeing your month as a pace, in Tito Finance navy, indigo and French blue on champagne ivory.
colors:
  navy: "#0B1B3F"
  brand: "#272C77"
  brand-pressed: "#1D2160"
  french-blue: "#2F5DA8"
  sky: "#8EC9F0"
  accent: "#2F5DA8"
  accent-tint: "#E3EBF7"
  on-brand: "#FFFFFF"
  on-brand-soft: "#C4E0F5"
  gold: "#C89B3C"
  gold-on-brand: "#D5B36B"
  burgundy: "#7A1F3D"
  burgundy-tint: "#F5E3E8"
  positive: "#2B6E47"
  ground: "#F6EFE2"
  surface: "#FFFDF8"
  ink: "#0B1B3F"
  ink-soft: "#424F70"
  ink-mute: "#5E6A88"
  line: "#E7DFD0"
  field-border: "#838796"
  switch-off: "#838796"
  bar-muted: "#6C88BA"
  brand-dark: "#1E2263"
  brand-end-dark: "#244A86"
  button-dark: "#AEB3FF"
  button-dark-pressed: "#9198F2"
  accent-dark: "#8EC9F0"
  accent-tint-dark: "#1C3A6B"
  on-brand-soft-dark: "#B4D3EE"
  gold-dark: "#C89B3C"
  burgundy-dark: "#E58AA3"
  burgundy-tint-dark: "#3A1830"
  positive-dark: "#86D0A4"
  ground-dark: "#0B1B3F"
  surface-dark: "#122752"
  raised-dark: "#1A3262"
  ink-dark: "#F6EFE2"
  ink-soft-dark: "#ADB4C5"
  ink-mute-dark: "#8992AD"
  line-dark: "#1F3363"
  field-border-dark: "#667599"
  switch-off-dark: "#667599"
  bar-muted-dark: "#4A6B99"
typography:
  total:
    fontFamily: "Fraunces SemiBold, Georgia, serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: "50px"
    letterSpacing: "-0.6px"
    fontFeature: "tnum"
  large-title:
    fontFamily: "Fraunces SemiBold, Georgia, serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "38px"
    letterSpacing: "-0.4px"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "26px"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "22px"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "22px"
  body-strong:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
  sub:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "19px"
  caption:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
  button:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "22px"
rounded:
  s: "8px"
  m: "12px"
  l: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "20px"
  xxl: "24px"
  xxxl: "32px"
  huge: "44px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "52px"
  button-primary-pressed:
    backgroundColor: "{colors.brand-pressed}"
  button-primary-dark:
    backgroundColor: "{colors.button-dark}"
    textColor: "{colors.ink}"
  button-primary-dark-pressed:
    backgroundColor: "{colors.button-dark-pressed}"
  button-secondary:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "52px"
  button-secondary-pressed:
    backgroundColor: "{colors.line}"
  button-danger:
    backgroundColor: "{colors.burgundy-tint}"
    textColor: "{colors.burgundy}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "52px"
  add-button:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 20px 0 16px"
    height: "56px"
  add-button-compact:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.pill}"
    size: "56px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.m}"
    padding: "0 16px"
    height: "50px"
  list-row:
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    padding: "12px 0"
    height: "64px"
  icon-disc:
    rounded: "{rounded.pill}"
    size: "40px"
  icon-disc-small:
    rounded: "{rounded.pill}"
    size: "36px"
  grouped-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.l}"
    padding: "0 16px"
  segmented-control:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "2px"
  segmented-control-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    height: "44px"
  toast:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-brand}"
    typography: "{typography.sub}"
    rounded: "{rounded.m}"
    padding: "0 8px 0 16px"
    height: "52px"
  toast-dark:
    backgroundColor: "{colors.raised-dark}"
---

# Design System: Tito Expense Tracker

## Overview

**Creative North Star: "The Indigo Pace Line"**

The app reads a month as a pace, not a ledger. A navy-to-French-blue gradient header holds the one number that matters (what you have spent so far) and a single sky-blue line tracking this month against last month to the same day. Everything below that header is quiet: a warm champagne-ivory ground (navy in dark mode), warm-white grouped surfaces, hairline dividers, and rows that put the category on the left and the amount on the right. The structure follows Wealthfront iOS (large totals, grouped lists, one accent, one primary button per screen) carried in Tito Finance's own colours and type.

Density is phone-native and generous: 20px side margins, 64px rows, 44pt (iOS) and 48dp (Android) minimum targets everywhere. Colour is rationed. Indigo is the brand voice and the primary action, with French blue for links; gold is the one crown pop (the "today" dot and small marks); burgundy marks a passed budget, always with words, and never reads as an alarm red; category hues live only inside small tinted discs. Type is Manrope for every working word with tabular figures on amounts, and Fraunces only for the big totals and large titles. One look ships on iOS and Android, with native tab bars, pickers, sheets and Back behaviour.

The world is calm and encouraging. It does not use dashboard tiles, promo cards, multi-colour charts or red warnings.

**Key Characteristics:**
- A static navy → indigo → French blue gradient on the home header and the auth welcome only; champagne ivory (or navy) ground below.
- Fraunces for totals and large titles; Manrope for everything else; tabular figures on every amount.
- Grouped lists with hairline dividers, round tinted icon discs, right-aligned amounts.
- One full-width pill primary button per task screen; a floating pill "Add expense" on the Home and Expenses tabs.
- Light and dark are designed pairs, not inversions; every text colour meets WCAG AA.

## Colors

Navy, Tito indigo and French blue carry the brand; sky blue adds light to it; a warm champagne ivory is the ground; gold is the one "crown" pop and burgundy the one warning, each rationed. Dark mode is built on the navy.

### Primary
- **Brand gradient** (navy → indigo → French blue, with a sky glow): the Home header and the Welcome screen, and nothing else. A static diagonal gradient from **Navy** (#0B1B3F, top left) through **Tito Indigo** (#272C77) to **French Blue** (#2F5DA8, bottom right), with a soft **Sky Blue** (#8EC9F0) glow at 28% in the text-free top-right corner (20% in dark mode, where the gradient runs through a deeper indigo, #1E2263, to a deeper French blue, #244A86). Drawn by `BrandGradient` with react-native-svg; never animated.
- **Tito Indigo** (brand / button): the primary button fill and the floating Add button in light mode. Pressed deepens to **Night Indigo** (brand-pressed).
- **French Blue** (accent): links, selected tab tint, focused field border, selected category outline, budget-bar fill and icon actions on the ivory ground. **Blue Mist** (accent-tint) is its tinted fill: secondary button, selected category tile, neutral disc. In dark mode the accent becomes **Sky Blue**.
- **Periwinkle** (button-dark): in dark mode, the primary button and the Add button become this light indigo with navy labels, because a dark indigo button disappears on a navy ground.
- **Sky Blue** (sky): the glow on the brand gradient and this month's pace line; the "Undo" action on the toast.

### Secondary
- **Crown Gold** (gold, #C89B3C): small marks only, never a fill: the 3px cap above the selected Reports month bar and the short rule under the Welcome wordmark. On the brand gradient the "today" dot uses **Gold on Brand** (gold-on-brand: #D5B36B in light mode, #C89B3C in dark), lifted just enough to reach 3:1 against French blue. Gold never carries meaning on its own: on the ivory ground #C89B3C is only 2.2:1, so it is decoration beside a state that is already shown.
- **Burgundy** (burgundy / burgundy-dark): a budget passed (bar fill and the "over the budget" line), form errors, and the destructive button text on **Burgundy Tint**. Lifted to a rose (#E58AA3) in dark mode for AA. Always with words.
- **Steady Green** (positive / positive-dark): reserved for positive status text; also the Food and Savings category hue.

### Neutral
- **Champagne Ivory** (ground, #F6EFE2) / **Navy** (ground-dark, #0B1B3F): the screen background under lists, and the track of segmented controls and the date stepper.
- **Surface** (surface, a warm white #FFFDF8 / surface-dark) and **Raised** (raised-dark): grouped cards, the add/edit sheet, fields, the selected segment, and the dark toast.
- **Ink** (ink: navy / ink-dark: ivory): titles, row titles, amounts. **Ink Soft**: field labels and supporting body copy. **Ink Mute**: row subtitles, placeholders, unselected tab icons.
- **Hairline** (line / line-dark): row dividers, budget-bar track, the top border of the bottom action bar.
- **Field Border** (field-border / field-border-dark): the resting border of text fields, at 3:1 against surface and ground (WCAG 1.4.11).
- **Switch Off** (switch-off / switch-off-dark): the track of a switch that is off, at 3:1 against surface, with the white thumb at 3:1 against it.
- **Muted Bar** (bar-muted / bar-muted-dark): unselected bars in the Reports month-by-month chart (3:1 against ground).
- **On-brand Soft** (on-brand-soft / on-brand-soft-dark): a pale sky; secondary text, axis labels and legend on the brand gradient (4.5:1 against its brightest point).

### Category hues
Each category has a light and dark icon colour; its disc is the same hue at 12% alpha (light) or 18% alpha (dark), and every icon reaches 3:1 on its disc over both surface and ground. Light / dark pairs: Rent and Business #3443A0 / #9EA8F6; Food and Savings #2B6E47 / #86D0A4; Transport and Education #1D5C94 / #86BDEB; Bills #87600F / #E7BE62; Airtime #5A3E9E / #BBA6F1; Family #A4462A / #F0947B; Faith #77502F / #DDB591; Personal care and Gift #9C3A67 / #EE9FC4; Health #A53737 / #F29C9C; Entertainment #246868 / #80CFCF; Shopping #843D9C / #DCA3EE; Other #53577A / #B3B6CF.

### Named Rules
**The Crown Rule.** Gold is the one pop: the today dot, an active mark, a small highlight. Never a large fill, never text, and never the only sign of a state.

**The One Warning Rule.** Burgundy means a budget passed or an error, and nothing else.

**The Disc-Only Rule.** Category colour lives inside the small tinted icon disc and nowhere else: not in bars, legends, fills or multi-colour charts. Ranked rows carry the comparison.

**The Never-Red Rule.** Overspending is shown in burgundy with words ("₦4,000 over the ₦90k budget"), never in alarm red and never by colour alone.

**The One Gradient Rule.** The brand gradient appears only on the Home header and Welcome, and it never moves. Everything else is flat ivory (or navy) and surface.

## Typography

**Display Font:** Fraunces SemiBold (with Georgia, serif)
**Body Font:** Manrope 400 to 800 (with system-ui, sans-serif)

**Character:** Fraunces gives the totals and screen titles a warm, editorial weight; Manrope keeps every list, label and button plain, round and legible at small sizes. Sizes are in points and scale with the OS text size up to 2x (1.5x for the amount input).

### Hierarchy
- **Total** (Fraunces 600, 44px, 50px, -0.6px, tabular): the month total on home and reports, and the amount input on add/edit. Shrinks to fit one line, down to 60%.
- **Large Title** (Fraunces 600, 32px, 38px, -0.4px): top-level tab titles and task-screen titles ("Add expense", "Settings"). The welcome headline is the one enlargement (40px / 46px).
- **Title** (Manrope 700, 20px, 26px): section headers ("Where it went", "Account").
- **Headline** (Manrope 700, 17px, 22px): month switcher label, form group labels, section totals.
- **Body** (Manrope 500, 16px, 22px) and **Body Strong** (600): running copy; row titles and row amounts.
- **Sub** (Manrope 500, 14px, 19px): row subtitles, field labels, hints and errors.
- **Caption** (Manrope 600, 12px, 16px): chart axis and legend, segmented options, category tile names.
- **Button** (Manrope 700, 17px, 22px): every button label, sentence case.

### Named Rules
**The Two Faces Rule.** Fraunces is for totals and large titles only. Rows, labels, buttons and section headers are Manrope.

**The Tabular Rule.** Every amount is set with tabular figures so columns of money align.

## Layout

A single phone column with 20px side margins, on a fixed 4/8-based scale (4, 8, 12, 16, 20, 24, 32, 44). Section headers sit 24px above their rows and 4px above the first one; task screens separate form groups by 24px. Home's gradient header runs under the status bar and fills roughly the top 45% (month switcher, total, pace line, chart, legend); the list starts on the ground below it. Tab screens open with a large title; task screens open with a close control and a large title, and end with a fixed bottom bar (top hairline, 12px padding plus safe area) holding the one primary button. The Home and Expenses lists reserve 120px plus the safe area at the bottom so the floating Add button never hides the last row. The native tab bar (Home, Expenses, Reports, Settings) is the only navigation; adding is a button, not a tab.

## Elevation & Depth

Flat by default, separated by tone: grouped cards (surface) sit on the ivory ground, and in dark mode raised surfaces step up from ground to surface to raised. Inset controls (segmented track, date stepper) drop back to the ground tone. Shadows exist only on the two things that float above content.

### Shadow Vocabulary
- **Floating action** (shadow navy #0B1B3F at 22% in light mode, black in dark, 8px blur, 0 4px offset; Android elevation 6): the Add expense button.
- **Toast** (shadow #000 at 18%, 8px blur, 0 3px offset; Android elevation 4): the undo snackbar.

### Named Rules
**The Only-Floaters Rule.** Shadows belong to elements that float over scrolling content. Cards, rows and buttons in the flow have none.

## Shapes

Round and soft. Every button, the floating Add button and every segmented control is a full pill (999px). Fields, toasts, the date stepper and category tiles use gently curved 12px corners; grouped settings cards use 16px; chart bars use 8px; the budget bar is a 6px track with 3px ends. Category and neutral icons sit in perfect circles (40px in lists and the picker, 36px in denser lists). Lines are 1px hairlines; focus thickens a field border to 2px. Icons are Tabler outline glyphs at a 1.75 stroke.

## Components

### Buttons
Calm, wide and unmistakable.
- **Shape:** full pill (999px), minimum 52px tall, 20px side padding, full width on task screens.
- **Primary:** Tito Indigo with white label (light); Periwinkle with navy label (dark). Pressed deepens one step. One per task screen, in the bottom bar.
- **Secondary:** Blue Mist with French Blue label (used for "Share as PDF"). **Danger:** Burgundy Tint with Burgundy label ("Delete expense", above the bottom bar). **Plain:** transparent, indigo label, tints on press.
- **Disabled / Loading:** 45% opacity; loading swaps the label for a spinner.
- **Welcome variant:** white pill with indigo label on the brand gradient, with a text-only second action below.

### Add expense (floating)
The one primary action on the Home and Expenses tabs (not on Reports or Settings). A 56px indigo pill 16px from the right edge, above the tab bar: "+ Add expense" at rest, collapsing to a round "+" once the list scrolls and hiding while scrolling down. Fades in over 160ms and out over 120ms, honouring Reduce Motion.

### Chips (segmented control)
- **Style:** a pill track in the ground tone with 2px padding; options are caption text in Ink Mute.
- **State:** the selected option becomes a surface-coloured pill with Ink text. Used for currency choice on add/edit and in settings.

### Cards / Containers
- **Corner Style:** 16px for grouped settings cards; 12px for inset wells.
- **Background:** surface on ground; inset wells use ground inside surface.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Internal Padding:** 16px horizontal; rows inside carry their own hairlines.

### Inputs / Fields
- **Style:** surface fill, 1px Field Border, 12px radius, 50px tall, 16px Manrope Medium, label in Sub / Ink Soft above.
- **Focus:** border becomes 2px French Blue (Sky Blue in dark mode). On web, keyboard focus gets a 3px accent outline with 2px offset.
- **Error:** border turns Burgundy; the message appears below in Sub / Burgundy through a polite live region.
- **Amount input:** no box; Total-size Fraunces digits with the currency symbol in Ink Soft, over a 2px accent underline.

### List rows
The core of the app. Leading tinted disc, title (Body Strong) and subtitle (Sub / Ink Mute) stacked, amount right-aligned in Body Strong tabular with an optional caption under it. 64px minimum, 12px vertical padding, 12px gap, 1px hairline between rows, last row without. Pressed rows drop to 60% opacity. Budgeted categories replace the subtitle with "left of" / "over the" words and a 6px budget bar (accent fill, burgundy past budget).

### Navigation
The system tab bar on each platform with SF Symbols (iOS) and Material icons (Android); selected tint is French Blue (Sky Blue in dark mode), unselected Ink Mute. A month switcher (chevrons in 44pt boxes around a Headline month name; next disabled at 35% in the current month) sits at the top of Home and Reports.

### Pace Chart (signature)
On the brand gradient: this month as a 2.5px sky-blue monotone line with a sky gradient fill (22% to 0%), last month as a 1.5px dashed line (4 on, 5 off) at 40 to 45% white, and the Gold on Brand today dot at the line's end. Three caption labels below (first day, "Today" under the dot, last day) and a two-item legend. 132px tall.

### Toast
A 52px snackbar with 12px corners, navy background (raised in dark), white Sub text and an optional "Undo" action in Sky Blue. Sits above the floating Add button; slides up over 220ms, out over 180ms; stays 6s, or 20s with a screen reader on when it carries an action.

## Do's and Don'ts

### Do:
- **Do** keep the brand gradient to the home header and the welcome screen; every other screen sits on the ivory (or navy) ground.
- **Do** give each task screen exactly one full-width pill primary button, in a bottom bar above a hairline.
- **Do** set every amount in tabular figures and right-align it in its row.
- **Do** show category identity only as a tinted disc (12% alpha light, 18% dark) behind a 1.75-stroke outline icon.
- **Do** design light and dark as pairs: in dark mode the primary action becomes Periwinkle with navy text.
- **Do** keep every touch target at least 44pt on iOS and 48dp on Android, and every text colour at WCAG AA.

### Don't:
- **Don't** use gold as a large fill, as text, or as the only sign of a state; keep it to the today dot and small crown marks.
- **Don't** signal overspending in red, or by colour alone; use burgundy plus words.
- **Don't** animate the brand gradient or add it to other screens.
- **Don't** put category colours into bars, stacked charts or legends; Reports ranks rows instead.
- **Don't** use Fraunces below the large-title size or for labels and buttons.
- **Don't** add shadows to in-flow cards, rows or buttons; only floating elements cast one.
- **Don't** build home as a bank dashboard of tiles, promos and a transaction list up top.
