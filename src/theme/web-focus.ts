import { Platform } from 'react-native';

/**
 * react-native-web removes outlines from most elements, so keyboard users on the web build
 * get no focus indicator (WCAG 2.4.7). Restore one for keyboard focus only, in the accent colour.
 */
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    :focus-visible { outline: 3px solid #2F359A !important; outline-offset: 2px; border-radius: 6px; }
    @media (prefers-color-scheme: dark) { :focus-visible { outline-color: #AEB3FF !important; } }
  `;
  document.head.appendChild(style);
}
