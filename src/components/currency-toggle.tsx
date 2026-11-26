import { currencyInfo } from '@/domain/money';
import { useCurrencyView } from '@/data/currency-view';

import { Segmented } from './segmented';

/**
 * Switches Expenses and Reports between the user's currencies (and any other currency that still
 * has expenses). Each is shown on its own, never converted. Hidden when there is only one.
 */
export function CurrencyToggle() {
  const { view, setView, options } = useCurrencyView();
  if (options.length < 2) return null;
  return (
    <Segmented
      label="Currency"
      value={view}
      onChange={setView}
      options={options.map((code) => ({ key: code, label: `${currencyInfo(code).symbol} ${code}`, a11yLabel: `${currencyInfo(code).name}` }))}
    />
  );
}
