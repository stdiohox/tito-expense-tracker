import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { ExpenseForm } from '@/components/expense-form';
import { safeBack } from '@/components/nav';
import { T } from '@/components/text';
import { useStore } from '@/data/store';
import type { Expense } from '@/domain/types';
import { space } from '@/theme/tokens';

export default function EditExpense() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses } = useStore();
  const found = expenses.find((e) => e.id === id);
  // Keep showing the form while the sheet animates away after this expense is deleted.
  const [kept, setKept] = useState<Expense | undefined>(found);
  if (found && found !== kept) setKept(found);
  const existing = found ?? kept;

  if (!existing) {
    return (
      <View style={{ flex: 1, padding: space.xl, gap: space.l, justifyContent: 'center' }}>
        <T variant="title" accessibilityRole="header">
          This expense is no longer here
        </T>
        <T variant="body" tone="inkSoft">
          It may have been deleted on another device.
        </T>
        <Button label="Close" variant="secondary" onPress={safeBack} />
      </View>
    );
  }
  return <ExpenseForm existing={existing} />;
}

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
