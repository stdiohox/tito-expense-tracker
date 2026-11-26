import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { CURRENCY_CODES, type CurrencyCode } from '@/domain/types';

import { useUsedCurrencies } from './expenses';
import { chosenCurrencies, useStore } from './store';

type CurrencyView = {
  /** The currency Expenses and Reports are showing. */
  view: CurrencyCode;
  setView: (c: CurrencyCode) => void;
  /**
   * What can be viewed: the user's currencies (main first), then any other currency that still has
   * expenses (one the user removed, say), so those expenses stay visible under their own currency.
   */
  options: CurrencyCode[];
};

const Ctx = createContext<CurrencyView | null>(null);

/** Which currency Expenses and Reports show, shared so switching on one switches both. Never converts. */
export function CurrencyViewProvider({ children }: { children: ReactNode }) {
  const { settings } = useStore();
  const usedList = useUsedCurrencies();
  const [picked, setPicked] = useState<CurrencyCode | null>(null);

  const options = useMemo(() => {
    const mine = chosenCurrencies(settings);
    const used = new Set(usedList);
    const known = CURRENCY_CODES.filter((c) => used.has(c) && !mine.includes(c));
    // A code no longer on the list (older saved data) still gets its own view, after the rest.
    const unlisted = [...used].filter((c) => !mine.includes(c) && !(CURRENCY_CODES as readonly string[]).includes(c)).sort();
    return [...mine, ...known, ...unlisted];
  }, [settings, usedList]);

  // Falls back to the main currency when the picked one is no longer an option.
  const view = picked && options.includes(picked) ? picked : settings.currency;
  const value = useMemo(() => ({ view, setView: setPicked, options }), [view, options]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrencyView(): CurrencyView {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCurrencyView must be used inside CurrencyViewProvider');
  return v;
}
