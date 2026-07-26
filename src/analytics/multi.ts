import type { PackageAnalytics } from './types';

/** Forward every call to several implementations, so a host can run e.g.
 * Clarity and GA4 side by side:
 *
 * ```ts
 * <FollowUpGate analytics={multiAnalytics([clarityAnalytics, gaAnalytics])}>
 * ```
 *
 * Each library event reaches each destination exactly once. Members are
 * isolated from one another: a member that throws synchronously, or returns a
 * rejecting promise, does not prevent the remaining members from receiving the
 * call, and never surfaces as an unhandled rejection.
 *
 * Errors are swallowed here and again by the provider's guard — pass
 * `onAnalyticsError` to the provider if you want to see them.
 *
 * No third-party imports, which is why this helper belongs in `src/` while the
 * SDK adapters do not. */
export function multiAnalytics(impls: PackageAnalytics[]): PackageAnalytics {
  const fanOut = (run: (impl: PackageAnalytics) => unknown) => {
    for (const impl of impls) {
      try {
        const result = run(impl);
        if (result && typeof (result as Promise<void>).catch === 'function') {
          (result as Promise<void>).catch(() => {});
        }
      } catch {
        // ponytail: swallowed here, reported by the provider guard one level up.
      }
    }
  };

  return {
    logEvent: (name, params) => fanOut((i) => i.logEvent(name, params)),
    setUserId: (id) => fanOut((i) => i.setUserId(id)),
    setProperty: (key, value) => fanOut((i) => i.setProperty(key, value)),
    screenView: (screenName) => fanOut((i) => i.screenView(screenName)),
  };
}
