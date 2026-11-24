import { Platform } from 'react-native';

import { dark, light } from './tokens';

let tag: HTMLStyleElement | null = null;

/**
 * react-native-web removes outlines from most elements, so keyboard users on the web build
 * get no focus indicator (WCAG 2.4.7). Restore one for keyboard focus only, in the accent colour
 * of the scheme in use (the Appearance setting, not only the browser's preference).
 */
export function applyWebFocusRing(scheme: 'light' | 'dark') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (!tag) {
    tag = document.createElement('style');
    document.head.appendChild(tag);
  }
  const ring = scheme === 'dark' ? dark.focusRing : light.focusRing;
  tag.textContent = `:focus-visible { outline: 3px solid ${ring} !important; outline-offset: 2px; border-radius: 6px; }`;
}
