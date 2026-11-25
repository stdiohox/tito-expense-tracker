// Run: node scripts/check-contrast.mjs — WCAG AA contrast for every text/background pair the app uses,
// plus 3:1 for the non-text indicators (borders, tracks, bars, dots). Reads src/theme/tokens.ts.
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../src/theme/tokens.ts', import.meta.url), 'utf8');
const block = (name) => Object.fromEntries([...src.split(`export const ${name}: Palette = {`)[1].split('};')[0].matchAll(/(\w+): '(#[0-9A-Fa-f]{6})'/g)].map((m) => [m[1], m[2]]));
const cats = [...src.split('export const categoryColors')[1].split('};')[0].matchAll(/light: '(#\w{6})', dark: '(#\w{6})'/g)];
// Per-scheme numbers such as `glow: { light: 0.22, dark: 0.14 }` inside an exported const.
const perScheme = (name) => {
  const body = src.split(`export const ${name} = {`)[1].split('} as const;')[0];
  return Object.fromEntries([...body.matchAll(/(\w+): \{ light: ([\d.]+), dark: ([\d.]+) \}/g)].map((m) => [m[1], { light: Number(m[2]), dark: Number(m[3]) }]));
};
const geometry = perScheme('brandGradient');
const glass = perScheme('glass');
const dockGlass = perScheme('dockGlass');

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (fg, bg, a) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(bg.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');

// The brand gradient as BrandGradient draws it, in bounding-box units: linear (0,0) -> (1,1) with stops
// at 0, mid and 1; an icy glow centred (1,0), radius 0.65; a white sheen centred (0,1), radius 0.55;
// both fading linearly to 0. Sampled on a 21 x 21 grid. The optional hero flare (brandGradient.flare)
// paints only inside flareRadius of the top-right corner, where heroes place no text, so it is left
// out of these samples on purpose. The bottom fade band holds no content (the
// component pads below its children), so it is not a text background and is not sampled.
const gradient = (p, scheme) => {
  const mid = geometry.mid[scheme];
  const pts = [];
  for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) {
    const x = i / 20, y = j / 20, t = (x + y) / 2;
    let col = t <= mid ? mix(p.brandMid, p.brandStart, t / mid) : mix(p.brandEnd, p.brandMid, (t - mid) / (1 - mid));
    let d = Math.hypot(x - 1, y) / 0.65;
    if (d < 1) col = mix(p.brandGlow, col, geometry.glow[scheme] * (1 - d));
    d = Math.hypot(x, y - 1) / 0.55;
    if (d < 1) col = mix(p.onBrand, col, geometry.sheen[scheme] * (1 - d));
    pts.push(col);
  }
  return pts;
};

let fail = 0;
let count = 0;
const report = (label, r, min) => { count++; const ok = r >= min; if (!ok) fail++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)} ≥ ${min}  ${label}`); };
const check = (label, fg, bg, min) => report(label, ratio(fg, bg), min);
const worst = (label, fg, pts, min) => report(`${label} (worst point)`, Math.min(...pts.map((bg) => ratio(fg, bg))), min);

for (const [scheme, p] of [['light', block('light')], ['dark', block('dark')]]) {
  // Text on the grounds the app uses.
  for (const bg of ['ground', 'surface', 'raised']) {
    for (const fg of ['ink', 'inkSoft', 'inkMute', 'accent', 'burgundy', 'danger', 'positive', 'popOnGround']) check(`${scheme} ${fg} on ${bg}`, p[fg], p[bg], 4.5);
  }
  check(`${scheme} onButton on button`, p.onButton, p.button, 4.5);
  check(`${scheme} accent on accentTint`, p.accent, p.accentTint, 4.5);
  check(`${scheme} ink on accentTint (selected tile)`, p.ink, p.accentTint, 4.5);
  check(`${scheme} danger on dangerTint`, p.danger, p.dangerTint, 4.5);
  check(`${scheme} onBadge on badge (% badge)`, p.onBadge, p.badge, 4.5);
  check(`${scheme} onToast on toast`, p.onToast, p.toast, 4.5);
  check(`${scheme} toastAction on toast`, p.toastAction, p.toast, 4.5);
  check(`${scheme} onWelcomeButton on onBrand (white pill)`, p.onWelcomeButton, p.onBrand, 4.5);
  check(`${scheme} onWelcomeButton on onBrandSoft (pressed)`, p.onWelcomeButton, p.onBrandSoft, 4.5);

  // Non-text indicators.
  for (const bg of ['ground', 'surface']) check(`${scheme} primary button on ${bg} (non-text)`, p.button, p[bg], 3);
  check(`${scheme} field border on surface (non-text)`, p.fieldBorder, p.surface, 3);
  check(`${scheme} field border on ground (non-text)`, p.fieldBorder, p.ground, 3);
  check(`${scheme} switch off-track on surface (non-text)`, p.switchOff, p.surface, 3);
  check(`${scheme} switch on-track on surface (non-text)`, p.button, p.surface, 3);
  check(`${scheme} switch thumb on off-track (non-text)`, p.thumb, p.switchOff, 3);
  check(`${scheme} barMuted on ground (non-text)`, p.barMuted, p.ground, 3);
  check(`${scheme} selected bar on ground (non-text)`, p.button, p.ground, 3);
  check(`${scheme} progress fill on its track (non-text)`, p.accent, p.line, 3);
  check(`${scheme} over-budget fill on its track (non-text)`, p.burgundy, p.line, 3);
  check(`${scheme} success mark (pop) on toast (non-text)`, p.pop, p.toast, 3);
  check(`${scheme} focusRing on ground (non-text)`, p.focusRing, p.ground, 3);
  check(`${scheme} focusRing on surface (non-text)`, p.focusRing, p.surface, 3);

  // The brand gradient, and frosted glass on it: navy tint at glass.tint, then white frost at glass.frost.
  const pts = gradient(p, scheme);
  const glassPts = pts.map((bg) => mix(p.glassEdge, mix(p.glassTint, bg, glass.tint[scheme]), glass.frost[scheme]));
  check(`${scheme} onBrand on brand (solid fallback)`, p.onBrand, p.brand, 4.5);
  worst(`${scheme} onBrand on brand gradient`, p.onBrand, pts, 4.5);
  worst(`${scheme} onBrandSoft on brand gradient`, p.onBrandSoft, pts, 4.5);
  worst(`${scheme} pace line on brand gradient (non-text)`, p.chartLine, pts, 3);
  worst(`${scheme} today dot / active dot (pop) on brand gradient (non-text)`, p.pop, pts, 3);
  worst(`${scheme} onBrand on glass card`, p.onBrand, glassPts, 4.5);
  worst(`${scheme} onBrandSoft on glass card`, p.onBrandSoft, glassPts, 4.5);
  worst(`${scheme} pop text on glass card`, p.pop, glassPts, 4.5);
  check(`${scheme} avatar initials (onAvatar on avatar)`, p.onAvatar, p.avatar, 4.5);
  worst(`${scheme} avatar disc on brand gradient (non-text)`, p.avatar, pts, 3);

  // Category icons on their discs, over each surface a disc sits on.
  cats.forEach(([, l, d], i) => {
    const fg = scheme === 'light' ? l : d;
    for (const bg of ['surface', 'ground']) {
      check(`${scheme} category ${i} icon on its disc over ${bg} (non-text)`, fg, mix(fg, p[bg], scheme === 'light' ? 0.12 : 0.18), 3);
    }
  });
}
// The floating dock: frosted white glass in both modes, its content in the light palette. Anything
// can scroll behind it, so its fill is checked over the darkest and lightest grounds and panels.
{
  const L = block('light');
  const D = block('dark');
  const behind = [L.ground, L.surface, D.ground, D.surface, D.raised, L.brandStart, L.brandMid, L.brandEnd];
  for (const scheme of ['light', 'dark']) {
    const fills = behind.map((bg) => mix(L.dock, bg, dockGlass.fill[scheme]));
    worst(`${scheme} dock: inactive tab (inkMute) on the glass`, L.inkMute, fills, 4.5);
    worst(`${scheme} dock: active tab (accent) on the glass`, L.accent, fills, 4.5);
    worst(`${scheme} dock: + button (button) on the glass (non-text)`, L.button, fills, 3);
  }
}
console.log(`${count - fail} of ${count} pairs pass`);
process.exitCode = fail ? 1 : 0;
