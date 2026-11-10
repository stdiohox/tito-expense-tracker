import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

/**
 * After a failed submit: say the first error out loud and move focus to its field.
 * Live regions do not exist on iOS, so VoiceOver needs the explicit announcement.
 */
export function announceError(message: string, target?: { current: unknown } | null) {
  if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(message);
  const node = target?.current;
  if (!node) return;
  if (Platform.OS === 'web') {
    (node as { focus?: () => void }).focus?.();
    return;
  }
  const handle = findNodeHandle(node as Parameters<typeof findNodeHandle>[0]);
  if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
}
