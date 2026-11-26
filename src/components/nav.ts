import { router, type Href } from 'expo-router';

/**
 * Go back; with nothing underneath (a cold deep link or a web refresh), replace with `fallback`.
 * Signed-out screens must pass a signed-out fallback, because Home is guarded for them.
 */
export function backOr(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

/** Close a sheet or go back from a signed-in screen; with nothing underneath, go home. */
export function safeBack() {
  backOr('/');
}
