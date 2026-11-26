import { useLocalSearchParams } from 'expo-router';

import { ExpenseForm } from '@/components/expense-form';

export default function NewExpense() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  return <ExpenseForm presetCategory={category} />;
}

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
