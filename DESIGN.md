---
name: Tito Expense Tracker
description: A calm phone app for seeing your month as a pace, in deep navy, royal and electric blue, with one aqua-mint pop.
colors:
  navy: "#141033"
  royal: "#2631AD"
  electric: "#2F5BE7"
  icy: "#CBE9FD"
  mint: "#2AFFCC"
  white: "#FFFFFF"
  brand: "#2631AD"
  brand-pressed: "#1C2589"
  accent: "#2F5BE7"
  accent-tint: "#E2EEFD"
  on-brand: "#FFFFFF"
  on-brand-soft: "#E1EAFB"
  pop-on-ground: "#0D7B62"
  badge: "#E9FFFA"
  on-badge: "#0D7B62"
  burgundy: "#7A1F3D"
  burgundy-tint: "#F7E3E9"
  positive: "#2B6E47"
  ground: "#F1F5FC"
  surface: "#FFFFFF"
  ink: "#141033"
  ink-soft: "#4D4E74"
  ink-mute: "#69698B"
  line: "#E1E7F3"
  field-border: "#8589A7"
  switch-off: "#8589A7"
  bar-muted: "#7A86D0"
  ground-dark: "#141033"
  surface-dark: "#1E1A4A"
  raised-dark: "#29245E"
  brand-mid-dark: "#1F2690"
  brand-end-dark: "#2A50CF"
  button-dark: "#3560E8"
  accent-dark: "#7693EF"
  accent-tint-dark: "#212665"
  on-brand-soft-dark: "#C6D8F8"
  badge-dark: "#10383F"
  burgundy-dark: "#E58AA3"
  burgundy-tint-dark: "#3A1838"
  positive-dark: "#86D0A4"
  ink-dark: "#F4F5FF"
  ink-soft-dark: "#B7B9D8"
  ink-mute-dark: "#9194B6"
  line-dark: "#2C2862"
  field-border-dark: "#6A6999"
  switch-off-dark: "#6A6999"
  bar-muted-dark: "#5C6CBE"
typography:
  hero:
    fontFamily: "Outfit SemiBold, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: "46px"
    letterSpacing: "-0.8px"
  total:
    fontFamily: "Outfit SemiBold, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: "50px"
    letterSpacing: "-1px"
    fontFeature: "tnum"
  large-title:
    fontFamily: "Outfit SemiBold, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "38px"
    letterSpacing: "-0.5px"
  title:
    fontFamily: "Outfit SemiBold, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "26px"
  headline:
    fontFamily: "Outfit SemiBold, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "22px"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "22px"
  body-strong:
    fontFamily: "Outfit Medium, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "22px"
  sub:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "19px"
  caption:
    fontFamily: "Outfit Medium, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
  button:
    fontFamily: "Outfit SemiBold, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "22px"
rounded:
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "20px"
  xxl: "28px"
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
    height: "52px"
  button-primary-dark:
    backgroundColor: "{colors.button-dark}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
  button-danger:
    backgroundColor: "{colors.burgundy-tint}"
    textColor: "{colors.burgundy}"
    rounded: "{rounded.pill}"
  onboarding-button:
    backgroundColor: "{colors.white}"
    textColor: "{colors.royal}"
    rounded: "{rounded.pill}"
    height: "56px"
  dock-add-button:
    backgroundColor: "{colors.royal}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    size: "56px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xxl}"
    padding: "0 16px"
  panel-dark:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.xxl}"
  glass-card:
    backgroundColor: "navy at 25% (30% dark), then white frost at 10%"
    border: "1px white at 32% (28% dark)"
    rounded: "{rounded.xl}"
    padding: "16px"
  stat-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge:
    backgroundColor: "{colors.badge}"
    textColor: "{colors.on-badge}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
  dock:
    backgroundColor: "white at 94% (frosted glass), both modes"
    border: "1px ink at 10%"
    rounded: "{rounded.pill}"
    height: "64px"
    width: "88% of the screen, centred, 16px above the safe area"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    height: "50px"
  toast:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.m}"
    height: "52px"
---

# Design System: Tito Expense Tracker

## Overview

**Creative North Star: "Your month as a pace, in deep blue"**

The app reads a month as a pace, not a ledger. A deep navy-to-electric-blue gradient header holds the one number that matters (what you have spent so far), a soft icy pace line against last month, and glass cards for each currency. Below it the app is calm and orderly: rounded panels, a dark Quick add panel for logging in one tap, budget cards in two columns, and a floating white-glass finance dock with the Add expense button at its centre. The look borrows the general language of premium blue finance apps (gradients, glass, dark panels) and builds it from our own components and SVG shapes; it copies no specific design or artwork.

Colour is rationed. Royal blue is the brand and the primary action; electric blue marks links, the active tab and progress; icy blue lightens; aqua mint is the one pop, used sparingly and only on dark or blue surfaces; burgundy marks a passed budget or an error, always with words. Type is Outfit throughout, with tabular figures on every amount. One look ships on iOS, Android and the web build.

**Key Characteristics:**
- A static navy → royal → electric gradient in the hero at the top of every tab (with a white flare in its top-right corner) and on the onboarding slides, and nowhere else.
- Every tab opens with the same hero: the title in the same place and style, then the month switcher and headline figure. Below it, rounded panels on the icy-white ground (light) or deep navy (dark), following the Appearance setting; Quick add stays a dark panel in both modes.
- Frosted glass cards on the gradient: a navy tint with a white frost, a light edge and a top highlight, no blur.
- One full-width primary button per task screen; on the tabs, the one primary action is the raised + in the middle of the dock.
- Light and dark are designed pairs; every text pair meets WCAG AA and every indicator 3:1.

## Colors

### Primary
- **Brand gradient** (tab heroes and onboarding): a static diagonal from **Deep Navy** (#141033, top left) through **Royal Blue** (#2631AD) to **Electric Blue** (#2F5BE7, bottom right), with an **Icy Blue** (#CBE9FD) glow at 22% in the text-free top-right corner and a faint white sheen bottom-left. Heroes add a white **flare** (55% at the corner, fading to 0 within 32% of the box) in the same corner for the brighter, whiter look; no text sits there. On the Home header a 28px band at the bottom fades to icy blue in light mode (to the navy ground in dark mode); no content ever sits in that band. Dark mode runs through a deeper royal (#1F2690) to a deeper electric (#2A50CF). Drawn by `BrandGradient` with react-native-svg; the gradient itself never animates (on onboarding a separate soft glow drifts behind the illustration; see Motion).
- **Royal Blue** (brand / button): the primary button in light mode; pressed deepens to #1C2589.
- **Electric Blue** (accent): links, the active tab, progress fills, the focused field border and selection outlines, on the light ground. In dark mode text needs more light, so the accent lifts to **#7693EF**; the dark primary button is **#3560E8**, the lightest electric that keeps its white label at 4.5:1 and still stands 3:1 off the sheet surface.
- **Icy Blue**: the gradient's glow and light-mode end, the pace line, the toast's Undo, and the light tint (**Blue Mist** #E2EEFD) behind selected items.

### The pop
- **Aqua Mint** (#2AFFCC, `pop`): the ONE pop colour. The today dot on the pace line, the active onboarding indicator, the % change on the main currency's glass card, and the check on success toasts. Only on dark or blue surfaces (gradient, glass, dark panels, toasts), where it passes 3:1 (non-text) or 4.5:1 (text).
- **Teal** (#0D7B62, `popOnGround`): the pop as it may appear on light surfaces: % badges (on #E9FFFA) and the crown above the selected Reports bar. In dark mode `popOnGround` is the mint itself.

### Warning
- **Burgundy** (#7A1F3D) / **Rose** (#E58AA3, dark): a budget passed (bar fill, badge, "₦8,350 over" words) and form errors; destructive text on its tint. Always with words, never colour alone, never alarm red.
- **Steady Green** (positive): reserved for positive status text; also the Food and Savings category hue.

### Neutral
- **Ground** (light #F1F5FC, an icy white; dark #141033, the deep navy) under every screen.
- **Surface** (white / #1E1A4A) for panels, cards, sheets and fields; **Raised** (#29245E) for the dark toast.
- **Ink** (navy / #F4F5FF), **Ink Soft**, **Ink Mute** for text; **Hairline** for dividers and tracks; **Field Border** and **Switch Off** at 3:1 against surface and ground.
- **Muted Bar** (#7A86D0 / #5C6CBE): unselected Reports bars, 3:1 against ground and surface.
- **On-brand Soft** (#E1EAFB / #C6D8F8): secondary text on the gradient, 4.5:1 against its brightest point, and above that on glass.

### Category hues
Each category has a light and a dark icon colour; its disc is the same hue at 12% (light) or 18% (dark). Inside dark panels the dark hues are used in both modes. Every icon reaches 3:1 on its disc over surface and ground. Pairs: Rent and Business #3443A0 / #9EA8F6; Food and Savings #2B6E47 / #86D0A4; Transport and Education #1D5C94 / #86BDEB; Bills #87600F / #E7BE62; Airtime #5A3E9E / #BBA6F1; Family #A4462A / #F0947B; Faith #77502F / #DDB591; Personal care and Gift #9C3A67 / #EE9FC4; Health #A53737 / #F29C9C; Entertainment #246868 / #80CFCF; Shopping #843D9C / #DCA3EE; Other #53577A / #B3B6CF.

### Named Rules
**The One Pop Rule.** Aqua mint is the only pop, and it appears only on dark or blue surfaces; on light surfaces use teal. It marks today, the active step, a % figure or a success, and never fills a large area.

**The One Warning Rule.** Burgundy (rose in dark mode) means a budget passed or an error, and nothing else.

**The Never-Red Rule.** Overspending is shown in burgundy with words ("₦4,000 over"), never in alarm red and never by colour alone.

**The Disc-Only Rule.** Category colour lives inside the small tinted icon disc and nowhere else: not in bars, legends or charts.

**The One Gradient Rule.** The brand gradient appears only in the tab heroes and on the onboarding slides, and it never moves. The one exception is a soft icy glow that drifts slowly behind the onboarding illustrations, kept inside the illustration box and away from all text.

## Typography

**Font:** Outfit (Regular 400, Medium 500, SemiBold 600), with system-ui as the fallback.

**Tabular figures:** Outfit's default digits are proportional, but its `tnum` OpenType feature gives all ten digits the same width (590 units) in every weight. Every amount sets `fontVariant: ['tabular-nums']` (the `numeric` prop on `T`), so columns of money align.

### Hierarchy
- **Hero** (SemiBold 40/46, -0.8): onboarding headlines.
- **Total** (SemiBold 44/50, -1, tabular): the month total and the amount input. Shrinks to fit, down to 60%.
- **Large Title** (SemiBold 32/38, -0.5): tab titles and task-screen titles.
- **Title** (SemiBold 20/26): panel titles, stat figures, greeting.
- **Headline** (SemiBold 17/22): month switcher, form group labels, day headers.
- **Body** (Regular 16/22) and **Body Strong** (Medium 16/22): running copy; row titles and amounts.
- **Sub** (Regular 14/19): subtitles, labels, hints, errors.
- **Caption** (Medium 12/16): chart labels, tab labels, badges, Quick add labels.
- **Button** (SemiBold 17/22): every button label.

Sizes scale with the OS text size up to 2× (1.5× for the amount input, 1.6× for tile labels).

## Layout

A single phone column. Screens use 16px side margins with panels edge to edge inside them; titles inset 4px more. A 4/8 scale (4, 8, 12, 16, 20, 24, 32, 44). Every tab starts with the shared hero card (`ScreenHero`): a rounded (28px) gradient card set 16px in from the screen edges, so the page's ground shows around it, with the title ("Hello, Ada" on Home, the tab name elsewhere) at the same position and size, then the month switcher and the month total (Home adds the pace line, chart and glass currency cards; Settings shows the account). Home continues with Quick add, Budgets (two columns), Where it went (top five) and Latest; its body follows the Appearance setting. Expenses, Reports and Category detail open with two stat cards where it helps, then panels. The floating dock (Home, Expenses, the raised +, Reports, Settings) is the only navigation; adding is a button, not a tab. Tab screens reserve the tab bar's height plus room for the Add button at the bottom, so nothing hides behind them.

## Motion

Calm and brief, never decorative for its own sake, and always off with Reduce Motion (the end state appears at once):
- **Reveal:** when a tab first appears, the hero card and then each section fade in and lift 12px, 70ms apart (380ms each).
- **Counting totals:** hero totals count up to their value (650ms ease-out) and again when the month changes; screen readers hear the final figure.
- **Budget bars** grow to their level (700ms ease-out).
- **Press:** Quick add tiles and budget cards press in slightly (to 94–97%).
- **Toast** slides up over 220ms and out over 180ms.
- **Bottom sheet** slides up over 300ms and down over 200ms; dragging follows the finger.
- **Charts** on Reports grow in over 700ms when the month changes.
- **Onboarding** illustrations play once each time their slide shows: cards slide in, icons pop, totals count up, the pace line draws itself, budget bars grow and the donut sweeps in (0.4–1.4s, ease-out). Glass cards float a few points up and down over about 3s, and a soft icy glow drifts behind them over 9s. Calm, never busy.
The brand gradient itself never moves.

## Elevation & Depth

Flat by default, separated by tone: panels and cards (surface) on the ground; in dark mode ground, surface and raised step up in light. Shadows only on things that float: the dock (navy at 22%, 24px blur, 10px down) and the toast (black at 18%).

## Shapes

Round and soft. Panels 28px; cards, glass cards and budget cards 20px; fields, toasts and tiles 12px; chart bars 8px; every button, the dock's + button, segmented controls, badges and the onboarding indicator are full pills. Icons are Tabler outline glyphs at 1.75 stroke.

## Components

### Buttons
- **Primary:** royal blue with white label (light); electric #3560E8 with white label (dark). One per task screen, in a bottom bar above a hairline.
- **Secondary:** Blue Mist with electric label. **Danger:** burgundy tint with burgundy label. **Plain:** transparent, electric label.
- **Onboarding:** a white pill with a royal label on the gradient; Next, then Create an account.

### Finance dock
A frosted white-glass bar floating over the page in both modes: 88% of the screen width, centred, 16px above the bottom safe area, 64px tall with pill ends. White at 94% (the most see-through it can be while its labels stay at AA with deep navy scrolling behind it), a 1px ink-tinted edge, a light highlight along the top and a soft navy shadow, so it always stands out from the page. Home and Expenses on the left, Reports and Settings on the right, icon over label, in the light palette: the active tab in electric, the others in Ink Mute. In the middle, a raised 56px round **+** in royal blue with a white plus, set 14px above the bar in a ring of the same glass, opens Add expense from any tab: the app's one primary action, one tap away. The dock steps aside while the keyboard is open. Built with expo-router/ui on every platform.

### Panels and cards
- **Panel:** 28px corners, surface fill, an optional title row with an action on the right. A **dark panel** renders its contents in the dark palette in both modes (Quick add, Latest).
- **Glass card:** on the gradient only: navy tint at 25%, then a white frost at 10% (the most that keeps white, soft and mint text at AA over the whole gradient), a 1px white edge at 32%, a brighter highlight along the top and a small decorative two-circle mark top-right; 20px corners. A translucent fill rather than a blur, so it looks the same in Expo Go, on Android and on the web; the tint darkens what is behind it, which keeps white text on it above AA.
- **Stat card:** a label, a figure and a short note, in 2-column rows.
- **Budget card:** icon disc and % badge, the name, "spent / budget", a slim bar, and "left" or "over" in words.
- **Badge:** a small pill with a figure: teal on mint-white (mint on dark teal in dark mode); burgundy on its tint when over.

### Quick add
A dark panel with a 4-column grid of the visible categories: icon disc and a short label (the full name for screen readers). A tap opens Add expense with that category chosen.


### Currencies
**Currency picker** (setup step 1 and Settings → Money): a field-styled row showing the flag, code, symbol and name that opens a search field and the list below it, grouped under small region headings on the ground colour (Africa, Europe, Americas, Middle East and Asia, Oceania). Each row shows flag, code, name, country · symbol, and the selected one sits on Blue Mist with an electric check. Search matches every country that uses a currency. The main currency is required; the second is optional ("None") and the main one is greyed out in its list. **Currency toggle** (Expenses and Reports): a segmented control of "₦ NGN", "$ USD" and so on, shown only when there is more than one; it switches the whole screen and never converts. **Home** has a glass card per currency (flag, code and name; its own total and payments), and tapping one opens Expenses in that currency. Budgets with two currencies get the same segmented control to pick the budget's currency.

### Bottom sheet
Add expense, Edit expense and Edit category open as a sheet drawn by the app (the same on iOS, Android and web), over the dimmed page (scrim: navy at 40%, black in dark mode). It opens just tall enough for the essentials and Save (never under 45% of the screen), with a handle, the title and a ✕ on top and Save pinned at the bottom. Drag the header up for full height or down to close; the handle is also a button. It goes full height while the keyboard is open. Surface fill, 28px top corners.

### Avatar
Initials (first + last name) on an icy disc (#CBE9FD) in navy, with a white 2px ring: 32px next to the Home greeting, 56px at the top of Settings beside the name and email. No photos. Hidden from screen readers, since the name is said beside it.

### Reports charts
**Day by day:** a bar per day (Muted Bar; the picked day in electric with a small teal mark above it), last month as a dashed Ink Mute line, on a light panel. Tap for the nearest day or use the arrows; the line below gives that day and the same day last month. **Budgets:** a horizontal bar per budgeted category with the % and "₦X left", or a burgundy bar with "₦X over" in words.

### Pace chart
On the gradient: this month as a 2.5px icy-blue line with a soft fill, last month dashed in white at 40–45%, and the mint today dot.

### Name and wordmark
The app is **TET**, short for **Tito Finance Expense Tracker**. TET is the name under the app icon. In the app, the wordmark shows "TET" in spaced SemiBold with a small mint dot (teal on light grounds) and the full name beneath it in Caption: at the top of the onboarding slides and in the Settings footer. Screen readers hear "TET, Tito Finance Expense Tracker".

### Onboarding
Three full-bleed gradient slides, each with a live illustration built from the app's own components with fixed sample numbers, never the user's data (hidden from screen readers): 1) an expense card slides in, its icon pops and the amount counts up, then a "Saved" toast; 2) a glass card whose pace line draws itself as the total counts up, with a mint % chip; 3) three budget rows whose bars grow, with % badges, and a glass donut of spending by category in brand colours (icy, white, mint; never category colours). A hero headline bottom-left and supporting text. "01 / 03" and Skip at the top; a pill indicator whose active segment is mint and wider; one white pill. The setup after sign-up (currency, how hands-on, categories and up to four budgets) uses the light panels, a 3-segment electric progress bar, Skip on every step and one primary button.

### Inputs, rows, toast
Fields: surface fill, 1px Field Border, 2px electric on focus, burgundy on error with a polite live region. Rows: disc, title and subtitle, right-aligned tabular amount, 64px tall, hairline between. Toast: navy (raised in dark), white text, icy Undo, and a mint check on success.

## Do's and Don'ts

### Do:
- **Do** keep the gradient to the tab heroes and onboarding, and keep it still (only the onboarding glow drifts, away from text); keep text out of the hero's top-right corner, where the flare is.
- **Do** keep aqua mint to dark or blue surfaces, and use teal for the pop on light ones.
- **Do** give each task screen exactly one primary button.
- **Do** set every amount in tabular figures and right-align it.
- **Do** keep touch targets at 44pt (iOS) and 48dp (Android), text at AA and indicators at 3:1.

### Don't:
- **Don't** use mint as a large fill, on a light surface, or as the only sign of a state.
- **Don't** show overspending in red or by colour alone; use burgundy plus words.
- **Don't** put category colours into bars, charts or legends.
- **Don't** add shadows to in-flow panels or cards; only floating elements cast one.
- **Don't** copy another app's design, artwork or card imagery; build shapes from our own components and SVG.

---

## Change note (redesign, 2026-11-24)

This version replaces the earlier navy-ivory-gold palette and the Manrope + Fraunces type with the palette and Outfit type above, and adds the floating finance dock, panels, frosted glass cards, Quick add, budget cards and onboarding. PRODUCT.md's brief is unchanged on purpose: its Brand Commitments still name Tito indigo, clay and gold, and the fonts of the old web tracker, as the client's original brief. The palette here supersedes them for the app's look; confirm with the client before updating the brief itself.
