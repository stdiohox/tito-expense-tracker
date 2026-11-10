import { IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconDisc } from '@/components/icon-disc';
import { Row } from '@/components/row';
import { T } from '@/components/text';
import { useStore } from '@/data/store';
import { formatMoney } from '@/domain/money';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Categories() {
  const { categories, settings } = useStore();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ backgroundColor: c.ground }} contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.xxl }}>
      {categories.map((cat) => (
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
    </ScrollView>
  );
}
