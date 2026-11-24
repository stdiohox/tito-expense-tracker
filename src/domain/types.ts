export type CurrencyCode = 'NGN' | 'USD';

/** Light or dark: follow the phone ("system") or force one. */
export type AppearanceMode = 'system' | 'light' | 'dark';

/** A month in the user's local calendar, e.g. "2026-11". */
export type MonthKey = `${number}-${string}`;

/** A day in the user's local calendar, e.g. "2026-11-09". */
export type DayKey = `${number}-${string}-${string}`;

export type CategoryId = string;

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIcon;
  /** Monthly budget in minor units of the user's main currency; null = no budget. */
  budget: number | null;
  /** Currency the budget was set in; a budget never silently changes currency. */
  budgetCurrency?: CurrencyCode;
  builtIn: boolean;
};

export type Expense = {
  /** Client-generated id, stable across sync. */
  id: string;
  /** Minor units (kobo, cents). Always positive. */
  amount: number;
  currency: CurrencyCode;
  categoryId: CategoryId;
  /** Local calendar day the money was spent. */
  day: DayKey;
  note: string;
  createdAt: number;
  updatedAt: number;
};

export type CategoryIcon =
  | 'rent'
  | 'food'
  | 'transport'
  | 'bills'
  | 'airtime'
  | 'family'
  | 'faith'
  | 'personal'
  | 'health'
  | 'entertainment'
  | 'shopping'
  | 'other'
  | 'savings'
  | 'education'
  | 'gift'
  | 'business';
