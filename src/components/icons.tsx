import {
  IconBell,
  IconBriefcase,
  IconBulb,
  IconBus,
  IconDeviceMobile,
  IconDots,
  IconGift,
  IconHeartbeat,
  IconHome,
  IconMovie,
  IconPigMoney,
  IconPray,
  IconSchool,
  IconScissors,
  IconShoppingBag,
  IconToolsKitchen2,
  IconUsers,
} from '@tabler/icons-react-native';

import type { CategoryIcon } from '@/domain/types';

export const CATEGORY_ICONS: Record<CategoryIcon, typeof IconHome> = {
  rent: IconHome,
  food: IconToolsKitchen2,
  transport: IconBus,
  bills: IconBulb,
  airtime: IconDeviceMobile,
  family: IconUsers,
  faith: IconPray,
  personal: IconScissors,
  health: IconHeartbeat,
  entertainment: IconMovie,
  shopping: IconShoppingBag,
  other: IconDots,
  savings: IconPigMoney,
  education: IconSchool,
  gift: IconGift,
  business: IconBriefcase,
};

export const PICKABLE_ICONS = Object.keys(CATEGORY_ICONS) as CategoryIcon[];

export { IconBell };

/** One stroke weight for every icon in the app. */
export const STROKE = 1.75;
