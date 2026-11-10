import type { Category } from './types';

/** The twelve categories carried over from the web tracker, in its order. */
export const STARTER_CATEGORIES: Category[] = [
  { id: 'rent', name: 'Rent & Housing', icon: 'rent', budget: null, builtIn: true },
  { id: 'food', name: 'Food & Groceries', icon: 'food', budget: null, builtIn: true },
  { id: 'transport', name: 'Transportation', icon: 'transport', budget: null, builtIn: true },
  { id: 'bills', name: 'Bills & Utilities', icon: 'bills', budget: null, builtIn: true },
  { id: 'airtime', name: 'Airtime & Data', icon: 'airtime', budget: null, builtIn: true },
  { id: 'family', name: 'Family Support', icon: 'family', budget: null, builtIn: true },
  { id: 'faith', name: 'Faith & Giving', icon: 'faith', budget: null, builtIn: true },
  { id: 'personal', name: 'Personal Care', icon: 'personal', budget: null, builtIn: true },
  { id: 'health', name: 'Health', icon: 'health', budget: null, builtIn: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'entertainment', budget: null, builtIn: true },
  { id: 'shopping', name: 'Shopping', icon: 'shopping', budget: null, builtIn: true },
  { id: 'other', name: 'Other', icon: 'other', budget: null, builtIn: true },
];
