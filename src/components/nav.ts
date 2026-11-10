import { router } from 'expo-router';

/** Close a sheet or go back; on a cold deep link with nothing underneath, go home instead. */
export function safeBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
