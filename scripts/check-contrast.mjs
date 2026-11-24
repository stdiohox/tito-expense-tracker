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

let fail = 0;
const check = (label, fg, bg, min) => { const r = ratio(fg, bg); const ok = r >= min; if (!ok) fail++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)} ≥ ${min}  ${label}`); };

for (const [scheme, p] of [['light', block('light')], ['dark', block('dark')]]) {
  for (const bg of ['ground', 'surface']) for (const fg of ['ink', 'inkSoft', 'inkMute', 'accent', 'clay', 'danger', 'positive']) check(`${scheme} ${fg} on ${bg}`, p[fg], p[bg], 4.5);
  check(`${scheme} onBrand on brand`, p.onBrand, p.brand, 4.5);
  check(`${scheme} onBrandSoft on brand`, p.onBrandSoft, p.brand, 4.5);
  check(`${scheme} onButton on button`, p.onButton, p.button, 4.5);
  check(`${scheme} accent on accentTint`, p.accent, p.accentTint, 4.5);
  check(`${scheme} danger on dangerTint`, p.danger, p.dangerTint, 4.5);
  check(`${scheme} gold dot on brand (non-text)`, p.gold, p.brand, 3);
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
  cats.forEach(([, l, d], i) => {
    const fg = scheme === 'light' ? l : d;
    check(`${scheme} category ${i} icon on its disc (non-text)`, fg, mix(fg, p.surface, scheme === 'light' ? 0.12 : 0.18), 3);
  });
}
process.exitCode = fail ? 1 : 0;
