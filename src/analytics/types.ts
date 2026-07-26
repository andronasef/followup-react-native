/** The analytics surface this library emits into.
 *
 * The library NEVER initializes, owns, or imports an analytics SDK — Clarity
 * and Firebase are both process-wide native singletons bound to a single
 * project ID, so a library that initialized one would either steal the host's
 * data or lose its own. The host supplies an implementation of this interface
 * (see the "Analytics" section of the README for Clarity / GA4 adapters), or
 * supplies nothing and gets `noopAnalytics`.
 *
 * This file must never import anything third-party. That property is enforced
 * by `scripts/check-bundle-imports.js`. */
export interface PackageAnalytics {
  logEvent(name: string, params?: Record<string, unknown>): void | Promise<void>;
  setUserId(id: string | null): void | Promise<void>;
  setProperty(key: string, value: string): void | Promise<void>;
  screenView(screenName: string): void | Promise<void>;
}

/** The default. The library is fully functional with analytics entirely
 * absent — no provider mounted means every emit lands here. */
export const noopAnalytics: PackageAnalytics = {
  logEvent: () => {},
  setUserId: () => {},
  setProperty: () => {},
  screenView: () => {},
};

/** Optional error sink. Errors thrown (or promises rejected) by the host's
 * implementation are swallowed by default; pass `onAnalyticsError` to the
 * provider to observe them. */
export type AnalyticsErrorHandler = (error: unknown, method: keyof PackageAnalytics) => void;
