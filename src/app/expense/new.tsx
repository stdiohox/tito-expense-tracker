import { useLocalSearchParams } from 'expo-router';

import { ExpenseForm } from '@/components/expense-form';

export default function NewExpense() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  return <ExpenseForm presetCategory={category} />;
}
