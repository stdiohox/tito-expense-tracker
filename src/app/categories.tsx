import { IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconDisc } from '@/components/icon-disc';
import { Row } from '@/components/row';
import { T } from '@/components/text';
import { useStore } from '@/data/store';
import { visibleCategories } from '@/domain/categories';
import { formatMoney } from '@/domain/money';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Categories() {
  const { categories, settings } = useStore();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ backgroundColor: c.ground }} contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.xxl }}>
      {visibleCategories(categories).map((cat) => (
        <Row
          key={cat.id}
          leading={<IconDisc icon={cat.icon} size={36} />}
          title={cat.name}
          subtitle={cat.budget !== null ? `Budget ${formatMoney(cat.budget, cat.budgetCurrency ?? settings.currency)} a month` : 'No budget'}
          onPress={() => router.push({ pathname: '/category/edit', params: { id: cat.id } })}
          accessibilityHint="Edit this category"
        />
      ))}
      <Row
        leading={
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.accentTint, alignItems: 'center', justifyContent: 'center' }}>
            <IconPlus size={20} color={c.accent} strokeWidth={2} />
          </View>
        }
        title="Create a category"
        onPress={() => router.push('/category/edit')}
        divider={false}
      />
      <T variant="sub" tone="inkMute" style={{ marginTop: space.l }}>
        Budgets are monthly and reset on the 1st.
      </T>
      {categories.some((cat) => cat.hidden) ? (
        <T variant="sub" tone="inkMute" style={{ marginTop: space.s }}>
          {categories.filter((cat) => cat.hidden).length} hidden during setup. Their expenses still count. Redo setup in Settings to show them again.
        </T>
      ) : null}
    </ScrollView>
  );
}

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
