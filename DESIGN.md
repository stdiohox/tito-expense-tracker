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
  bar-muted-dark: "#505FAD"
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
  add-button:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.pill}"
    height: "56px"
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
  tab-bar:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.xxl}"
    height: "64px"
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

The app reads a month as a pace, not a ledger. A deep navy-to-electric-blue gradient header holds the one number that matters (what you have spent so far), a soft icy pace line against last month, and glass cards for each currency. Below it the app is calm and orderly: rounded panels, a dark Quick add panel for logging in one tap, budget cards in two columns, and a dark tab bar docked to the bottom edge. The look borrows the general language of premium blue finance apps (gradients, glass, dark panels) and builds it from our own components and SVG shapes; it copies no specific design or artwork.

Colour is rationed. Royal blue is the brand and the primary action; electric blue marks links, the active tab and progress; icy blue lightens; aqua mint is the one pop, used sparingly and only on dark or blue surfaces; burgundy marks a passed budget or an error, always with words. Type is Outfit throughout, with tabular figures on every amount. One look ships on iOS, Android and the web build.

**Key Characteristics:**
- A static navy → royal → electric gradient on the Home header and the onboarding slides only.
- Home is the brand scene in both modes: the bright gradient header flows into a deep navy body of dark panels. Other screens use rounded panels on the icy-white ground (light) or deep navy (dark), following the Appearance setting.
- Frosted glass cards on the gradient: a navy tint with a white frost, a light edge and a top highlight, no blur.
- One full-width primary button per task screen; the floating "Add expense" pill on Home and Expenses.
- Light and dark are designed pairs; every text pair meets WCAG AA and every indicator 3:1.

## Colors

### Primary
- **Brand gradient**: a static diagonal from **Deep Navy** (#141033, top left) through **Royal Blue** (#2631AD) to **Electric Blue** (#2F5BE7, bottom right), with an **Icy Blue** (#CBE9FD) glow at 22% in the text-free top-right corner and a faint white sheen bottom-left. On the Home header a 28px band at the bottom fades to icy blue in light mode (to the navy ground in dark mode); no content ever sits in that band. Dark mode runs through a deeper royal (#1F2690) to a deeper electric (#2A50CF). Drawn by `BrandGradient` with react-native-svg; never animated.
- **Royal Blue** (brand / button): the primary button and the Add button in light mode; pressed deepens to #1C2589.
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
- **Muted Bar** (#7A86D0 / #505FAD): unselected Reports bars, 3:1 against ground.
- **On-brand Soft** (#E1EAFB / #C6D8F8): secondary text on the gradient, 4.5:1 against its brightest point, and above that on glass.

### Category hues
Each category has a light and a dark icon colour; its disc is the same hue at 12% (light) or 18% (dark). Inside dark panels the dark hues are used in both modes. Every icon reaches 3:1 on its disc over surface and ground. Pairs: Rent and Business #3443A0 / #9EA8F6; Food and Savings #2B6E47 / #86D0A4; Transport and Education #1D5C94 / #86BDEB; Bills #87600F / #E7BE62; Airtime #5A3E9E / #BBA6F1; Family #A4462A / #F0947B; Faith #77502F / #DDB591; Personal care and Gift #9C3A67 / #EE9FC4; Health #A53737 / #F29C9C; Entertainment #246868 / #80CFCF; Shopping #843D9C / #DCA3EE; Other #53577A / #B3B6CF.

### Named Rules
**The One Pop Rule.** Aqua mint is the only pop, and it appears only on dark or blue surfaces; on light surfaces use teal. It marks today, the active step, a % figure or a success, and never fills a large area.

**The One Warning Rule.** Burgundy (rose in dark mode) means a budget passed or an error, and nothing else.

**The Never-Red Rule.** Overspending is shown in burgundy with words ("₦4,000 over"), never in alarm red and never by colour alone.

**The Disc-Only Rule.** Category colour lives inside the small tinted icon disc and nowhere else: not in bars, legends or charts.

**The One Gradient Rule.** The brand gradient appears only on the Home header and the onboarding slides, and it never moves.

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

A single phone column. Screens use 16px side margins with panels edge to edge inside them; titles inset 4px more. A 4/8 scale (4, 8, 12, 16, 20, 24, 32, 44). Home: the gradient header (greeting, month switcher, total, pace line, chart, glass currency cards) fading into a deep navy body, then Quick add, Budgets (two columns), Where it went (top five) and Latest, all as dark panels and cards in both modes. Expenses, Reports and Category detail open with two stat cards where it helps, then panels. The docked tab bar (Home, Expenses, Reports, Settings) is the only navigation; adding is a button, not a tab. Tab screens reserve the tab bar's height plus room for the Add button at the bottom, so nothing hides behind them.

## Elevation & Depth

Flat by default, separated by tone: panels and cards (surface) on the ground; in dark mode ground, surface and raised step up in light. Shadows only on things that float: the tab bar (navy at 25%, 12px blur), the Add button (navy at 22%, 8px blur) and the toast (black at 18%).

## Shapes

Round and soft. Panels 28px; cards, glass cards and budget cards 20px; fields, toasts and tiles 12px; chart bars 8px; every button, the Add button, segmented controls, badges and the onboarding indicator are full pills. Icons are Tabler outline glyphs at 1.75 stroke.

## Components

### Buttons
- **Primary:** royal blue with white label (light); electric #3560E8 with white label (dark). One per task screen, in a bottom bar above a hairline.
- **Secondary:** Blue Mist with electric label. **Danger:** burgundy tint with burgundy label. **Plain:** transparent, electric label.
- **Onboarding:** a white pill with a royal label on the gradient; Next, then Create an account.

### Tab bar
A dark bar docked to the bottom edge in both modes: full width, 64px tall plus the bottom safe area, with 28px rounded top corners. Icon over label; the active tab in electric (#7693EF on the dark bar), the others in Ink Mute. It steps aside while the keyboard is open. Built with expo-router/ui on every platform.

### Panels and cards
- **Panel:** 28px corners, surface fill, an optional title row with an action on the right. A **dark panel** renders its contents in the dark palette in both modes (Quick add, Latest).
- **Glass card:** on the gradient only: navy tint at 25%, then a white frost at 10% (the most that keeps white, soft and mint text at AA over the whole gradient), a 1px white edge at 32%, a brighter highlight along the top and a small decorative two-circle mark top-right; 20px corners. A translucent fill rather than a blur, so it looks the same in Expo Go, on Android and on the web; the tint darkens what is behind it, which keeps white text on it above AA.
- **Stat card:** a label, a figure and a short note, in 2-column rows.
- **Budget card:** icon disc and % badge, the name, "spent / budget", a slim bar, and "left" or "over" in words.
- **Badge:** a small pill with a figure: teal on mint-white (mint on dark teal in dark mode); burgundy on its tint when over.

### Quick add
A dark panel with a 4-column grid of the visible categories: icon disc and a short label (the full name for screen readers). A tap opens Add expense with that category chosen.

### Add expense (floating)
A 56px royal pill 16px above the tab bar on Home and Expenses: "+ Add expense" at rest, a round "+" once the list scrolls, hidden while scrolling down. Fades in 160ms and out 120ms, honouring Reduce Motion.

### Pace chart
On the gradient: this month as a 2.5px icy-blue line with a soft fill, last month dashed in white at 40–45%, and the mint today dot.

### Onboarding
Three full-bleed gradient slides, each with our own decorative SVG shapes in the palette (hidden from screen readers), a hero headline bottom-left and supporting text. "01 / 03" and Skip at the top; a pill indicator whose active segment is mint and wider; one white pill. The setup after sign-up (currency, how hands-on, categories and up to two budgets) uses the light panels, a 3-segment electric progress bar, Skip on every step and one primary button.

### Inputs, rows, toast
Fields: surface fill, 1px Field Border, 2px electric on focus, burgundy on error with a polite live region. Rows: disc, title and subtitle, right-aligned tabular amount, 64px tall, hairline between. Toast: navy (raised in dark), white text, icy Undo, and a mint check on success.

## Do's and Don'ts

### Do:
- **Do** keep the gradient to the Home header and onboarding, and keep it still.
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

This version replaces the earlier navy-ivory-gold palette and the Manrope + Fraunces type with the palette and Outfit type above, and adds the floating tab bar, panels, glass cards, Quick add, budget cards and onboarding. PRODUCT.md's brief is unchanged on purpose: its Brand Commitments still name Tito indigo, clay and gold, and the fonts of the old web tracker, as the client's original brief. The palette here supersedes them for the app's look; confirm with the client before updating the brief itself.
