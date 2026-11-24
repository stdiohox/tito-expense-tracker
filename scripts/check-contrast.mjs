// Run: node scripts/check-contrast.mjs — WCAG AA contrast for every text/background pair the app uses.
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../src/theme/tokens.ts', import.meta.url), 'utf8');
const block = (name) => Object.fromEntries([...src.split(`export const ${name}: Palette = {`)[1].split('};')[0].matchAll(/(\w+): '(#[0-9A-Fa-f]{6})'/g)].map((m) => [m[1], m[2]]));
const cats = [...src.split('export const categoryColors')[1].split('};')[0].matchAll(/light: '(#\w{6})', dark: '(#\w{6})'/g)];

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (fg, bg, a) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(bg.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');

// The brand gradient as BrandGradient draws it, in bounding-box units: linear (0,0) -> (1,1) with
// stops at 0, 0.5 and 1, plus a radial sky glow centred at (1,0), radius 0.6, fading linearly to 0.
// Sampled on a 21 x 21 grid; text on the header must pass against the worst sample.
const glowOpacity = Object.fromEntries([...src.split('export const brandGlowOpacity')[1].split('}')[0].matchAll(/(light|dark): ([\d.]+)/g)].map((m) => [m[1], Number(m[2])]));
const gradient = (p, a) => {
  const pts = [];
  for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) {
    const x = i / 20, y = j / 20, t = (x + y) / 2;
    let col = t <= 0.5 ? mix(p.brandMid, p.brandStart, t / 0.5) : mix(p.brandEnd, p.brandMid, (t - 0.5) / 0.5);
    const d = Math.hypot(x - 1, y) / 0.6;
    if (d < 1) col = mix(p.brandGlow, col, a * (1 - d));
    pts.push(col);
  }
  return pts;
};

let fail = 0;
const report = (label, r, min) => { const ok = r >= min; if (!ok) fail++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)} ≥ ${min}  ${label}`); };
const check = (label, fg, bg, min) => report(label, ratio(fg, bg), min);
const checkGradient = (label, fg, pts, min) => report(`${label} (worst point of the gradient)`, Math.min(...pts.map((bg) => ratio(fg, bg))), min);

for (const [scheme, p] of [['light', block('light')], ['dark', block('dark')]]) {
  for (const bg of ['ground', 'surface']) for (const fg of ['ink', 'inkSoft', 'inkMute', 'accent', 'burgundy', 'danger', 'positive']) check(`${scheme} ${fg} on ${bg}`, p[fg], p[bg], 4.5);
  const pts = gradient(p, glowOpacity[scheme]);
  check(`${scheme} onBrand on brand`, p.onBrand, p.brand, 4.5);
  checkGradient(`${scheme} onBrand on brand gradient`, p.onBrand, pts, 4.5);
  checkGradient(`${scheme} onBrandSoft on brand gradient`, p.onBrandSoft, pts, 4.5);
  checkGradient(`${scheme} pace line (chartLine) on brand gradient (non-text)`, p.chartLine, pts, 3);
  checkGradient(`${scheme} gold today dot on brand gradient (non-text)`, p.goldOnBrand, pts, 3);
  check(`${scheme} onBrandSoft on brand`, p.onBrandSoft, p.brand, 4.5);
  check(`${scheme} onButton on button`, p.onButton, p.button, 4.5);
  check(`${scheme} accent on accentTint`, p.accent, p.accentTint, 4.5);
  check(`${scheme} ink on accentTint (selected tile)`, p.ink, p.accentTint, 4.5);
  check(`${scheme} danger on dangerTint`, p.danger, p.dangerTint, 4.5);
  check(`${scheme} gold today dot on brand (non-text)`, p.goldOnBrand, p.brand, 3);
  check(`${scheme} barMuted on ground (non-text)`, p.barMuted, p.ground, 3);
  check(`${scheme} selected bar on ground (non-text)`, p.button, p.ground, 3);
  check(`${scheme} field border on surface (non-text)`, p.fieldBorder, p.surface, 3);
  check(`${scheme} field border on ground (non-text)`, p.fieldBorder, p.ground, 3);
  check(`${scheme} switch off-track on surface (non-text)`, p.switchOff, p.surface, 3);
  check(`${scheme} switch on-track on surface (non-text)`, p.button, p.surface, 3);
  check(`${scheme} switch thumb on off-track (non-text)`, p.thumb, p.switchOff, 3);
  check(`${scheme} onToast on toast`, p.onToast, p.toast, 4.5);
  check(`${scheme} toastAction on toast`, p.toastAction, p.toast, 4.5);
  check(`${scheme} onWelcomeButton on onBrand (Welcome button)`, p.onWelcomeButton, p.onBrand, 4.5);
  check(`${scheme} onWelcomeButton on onBrandSoft (pressed)`, p.onWelcomeButton, p.onBrandSoft, 4.5);
  check(`${scheme} focusRing on ground (non-text)`, p.focusRing, p.ground, 3);
  check(`${scheme} focusRing on surface (non-text)`, p.focusRing, p.surface, 3);
  // Discs sit on surface (cards, sheets) and on ground (Home, Expenses, Reports lists).
  cats.forEach(([, l, d], i) => {
    const fg = scheme === 'light' ? l : d;
    for (const bg of ['surface', 'ground']) {
      check(`${scheme} category ${i} icon on its disc over ${bg} (non-text)`, fg, mix(fg, p[bg], scheme === 'light' ? 0.12 : 0.18), 3);
    }
  });
}
process.exitCode = fail ? 1 : 0;
