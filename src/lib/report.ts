/**
 * One place for errors the app catches (error boundaries, unhandled promise rejections, the global
 * JS error handler). Logs them, and forwards them to crash reporting when it is connected
 * (see setReporter). Never throws: reporting must not cause a second crash.
 */
type Reporter = (error: unknown, context: Record<string, string>) => void;

let reporter: Reporter | null = null;

/** Called once by crash reporting (Sentry) when it starts. */
export function setReporter(next: Reporter | null) {
  reporter = next;
}

export function reportError(error: unknown, context: Record<string, string> = {}) {
  try {
    if (__DEV__) console.warn(`[TET] ${context.where ?? 'error'}:`, error);
    else console.error(`[TET] ${context.where ?? 'error'}:`, error instanceof Error ? error.message : String(error));
    reporter?.(error, context);
  } catch {
    // Reporting is best effort.
  }
}

type HermesTracker = {
  enablePromiseRejectionTracker?: (options: {
    allRejections: boolean;
    onUnhandled: (id: number, rejection: unknown) => void;
    onHandled: (id: number) => void;
  }) => void;
};
type ErrorUtilsLike = {
  getGlobalHandler: () => (error: unknown, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: unknown, isFatal?: boolean) => void) => void;
};

let installed = false;

/**
 * Catch what would otherwise vanish or crash silently: unhandled promise rejections (Hermes on
 * iOS and Android, `unhandledrejection` on the web) and uncaught JS errors (logged, then passed on
 * to React Native's own handler, so behaviour is unchanged). Safe to call more than once.
 */
export function installGlobalErrorHandlers() {
  if (installed) return;
  installed = true;
  const g = globalThis as typeof globalThis & { HermesInternal?: HermesTracker; ErrorUtils?: ErrorUtilsLike };

  // In development React Native already shows unhandled rejections in LogBox; keep that.
  if (!__DEV__ && g.HermesInternal?.enablePromiseRejectionTracker) {
    g.HermesInternal.enablePromiseRejectionTracker({
      allRejections: true,
      onUnhandled: (_id, rejection) => reportError(rejection, { where: 'unhandled promise rejection' }),
      onHandled: () => {},
    });
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('unhandledrejection', (event: { reason?: unknown }) =>
      reportError(event.reason, { where: 'unhandled promise rejection' }),
    );
  }

  const utils = g.ErrorUtils;
  if (utils?.getGlobalHandler && utils.setGlobalHandler) {
    const previous = utils.getGlobalHandler();
    utils.setGlobalHandler((error, isFatal) => {
      reportError(error, { where: isFatal ? 'fatal error' : 'uncaught error' });
      previous(error, isFatal);
    });
  }
}
