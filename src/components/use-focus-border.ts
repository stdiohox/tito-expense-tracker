import { useState } from 'react';

import { useTheme } from '@/theme/use-theme';

/**
 * The border of a text input, as in DESIGN.md (Inputs / Fields): a 1px Field Border at rest,
 * 2px Electric Blue while focused, Burgundy (Rose in dark mode) on error. `inset` is 1 while focused: subtract it from
 * the horizontal padding so the text doesn't shift when the border thickens.
 */
export function useFocusBorder(error?: boolean) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return {
    focusProps: { onFocus: () => setFocused(true), onBlur: () => setFocused(false) },
    border: {
      borderWidth: focused ? 2 : 1,
      borderColor: error ? c.danger : focused ? c.accent : c.fieldBorder,
    },
    inset: focused ? 1 : 0,
  };
}
