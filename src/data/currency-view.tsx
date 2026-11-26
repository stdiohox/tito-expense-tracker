import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { CURRENCY_CODES, type CurrencyCode } from '@/domain/types';

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
  const { settings, expenses } = useStore();
  const [picked, setPicked] = useState<CurrencyCode | null>(null);

  const options = useMemo(() => {
    const mine = chosenCurrencies(settings);
    const used = new Set(expenses.map((e) => e.currency));
    return [...mine, ...CURRENCY_CODES.filter((c) => used.has(c) && !mine.includes(c))];
  }, [settings, expenses]);

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
