import Constants from 'expo-constants';

import { setReporter } from './report';

/*
 * Crash reporting with Sentry (docs/SCALE-PLAN.md §7).
 *
 * Off unless EXPO_PUBLIC_SENTRY_DSN is set: without it Sentry is never even loaded, and the app
 * runs exactly as before. With it, crashes and the errors our boundaries catch are sent, with
 * personal data stripped: no amounts, notes, names or emails ever leave the phone.
 */

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const crashReportingEnabled = Boolean(DSN);

/** Any number, with its separators: "4,500", "1,250.50", "2026-11-26". Symbols stay, amounts go. */
const AMOUNT = /\d[\d,.]*/g;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

/** Removes emails and every number (amounts, kobo, dates typed in notes) from a string. */
export function scrubText(text: string): string {
  return text.replace(EMAIL, '[email]').replace(AMOUNT, '#');
}

type Frameish = { vars?: unknown };
type Eventish = {
  message?: string;
  user?: unknown;
  request?: unknown;
  extra?: unknown;
  contexts?: Record<string, unknown>;
  breadcrumbs?: { message?: string; data?: unknown }[];
  exception?: { values?: { value?: string; stacktrace?: { frames?: Frameish[] } }[] };
};

/** Strips personal data from a Sentry event before it is sent. Exported for tests. */
export function scrubEvent<E extends Eventish>(event: E): E {
  delete event.user;
  delete event.request;
  delete event.extra;
  if (event.contexts) delete event.contexts.state;
  if (event.message) event.message = scrubText(event.message);
  for (const value of event.exception?.values ?? []) {
    if (value.value) value.value = scrubText(value.value);
    for (const frame of value.stacktrace?.frames ?? []) delete frame.vars;
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => ({ ...b, message: b.message ? scrubText(b.message) : b.message, data: undefined }));
  }
  return event;
}

/** Errors Sentry already catches on its own; our handlers must not send them twice. */
const SENTRY_CATCHES = new Set(['fatal error', 'uncaught error', 'unhandled promise rejection']);

let started = false;

/** Starts Sentry if a DSN is configured. Never throws; failures leave the app running. */
export async function startCrashReporting() {
  if (!DSN || started) return;
  started = true;
  try {
    const Sentry = await import('@sentry/react-native');
    Sentry.init({
      dsn: DSN,
      environment: __DEV__ ? 'development' : 'production',
      // Expo Go has no Sentry native module; JavaScript errors are still reported there.
      enableNative: Constants.executionEnvironment !== 'storeClient',
      sendDefaultPii: false,
      attachScreenshot: false,
      attachViewHierarchy: false,
      // Release health (crash-free sessions) and a light sample of performance.
      enableAutoSessionTracking: true,
      tracesSampleRate: 0.1,
      // Only screen changes as breadcrumbs: taps and console lines can carry amounts.
      beforeBreadcrumb: (crumb) => (crumb.category === 'navigation' ? crumb : null),
      beforeSend: (event) => scrubEvent(event),
    });
    setReporter((error, context) => {
      if (SENTRY_CATCHES.has(context.where ?? '')) return;
      Sentry.captureException(error, { tags: { where: context.where ?? 'unknown' } });
    });
  } catch {
    // Crash reporting is optional; the app keeps running without it.
  }
}
