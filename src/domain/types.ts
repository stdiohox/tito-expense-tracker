/** The currencies the app supports (ISO 4217). Each expense keeps its own; nothing is ever converted. */
export const CURRENCY_CODES = ['NGN', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'KES', 'ZAR', 'XOF', 'EGP', 'AED', 'SAR', 'INR', 'CNY', 'JPY'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** Light or dark: follow the phone ("system") or force one. */
export type AppearanceMode = 'system' | 'light' | 'dark';

/** How hands-on the user wants to be (setup step 2): just track, track and budgets, or the full picture. */
export type SetupMode = 'track' | 'budgets' | 'full';

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
  /** Hidden from Add expense and the categories list (setup step 3); its expenses still count. */
  hidden?: boolean;
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
