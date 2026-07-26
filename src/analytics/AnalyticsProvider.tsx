import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { noopAnalytics } from './types';
import type { AnalyticsErrorHandler, PackageAnalytics } from './types';
import { prefixEventName, sanitizeParams, sanitizeScreenName } from './sanitize';

/** Default prefix: the package's short name, snake_cased. Kept short on
 * purpose — GA4 caps event names at 40 characters and the prefix eats into
 * that budget. */
export const DEFAULT_EVENT_PREFIX = 'followup';

interface AnalyticsConfig {
  analytics: PackageAnalytics;
  eventPrefix: string;
  onAnalyticsError?: AnalyticsErrorHandler;
}

/** The context holds the RAW implementation plus config — not a pre-wrapped
 * instance. `usePackageAnalytics` does the prefix/sanitize/guard wrapping, so
 * nesting a provider (which `FollowUpGate` does for its `analytics` prop)
 * can't double-prefix an event.
 *
 * The default value is a real, usable config. There is deliberately no
 * "missing provider" sentinel: analytics is optional, so the hook must never
 * throw for an unmounted provider. */
const AnalyticsContext = createContext<AnalyticsConfig>({
  analytics: noopAnalytics,
  eventPrefix: DEFAULT_EVENT_PREFIX,
});

export interface PackageAnalyticsProviderProps {
  children: React.ReactNode;
  /** Your implementation. Omit for no analytics — the library stays fully
   * functional. */
  analytics?: PackageAnalytics;
  /** Prefix applied to every event name. Defaults to `followup`. */
  eventPrefix?: string;
  /** Errors thrown or rejected by `analytics` are swallowed by default; this
   * surfaces them without letting them reach the library. */
  onAnalyticsError?: AnalyticsErrorHandler;
}

export function PackageAnalyticsProvider({
  children,
  analytics = noopAnalytics,
  eventPrefix = DEFAULT_EVENT_PREFIX,
  onAnalyticsError,
}: PackageAnalyticsProviderProps) {
  const value = useMemo<AnalyticsConfig>(
    () => ({ analytics, eventPrefix, onAnalyticsError }),
    [analytics, eventPrefix, onAnalyticsError]
  );
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

/** Returns a sanitized, failure-isolated `PackageAnalytics`.
 *
 * Never throws when no provider is mounted — it returns a guarded
 * `noopAnalytics` instead. Calls are fire-and-forget: nothing is awaited and
 * no state is set, so analytics can never block or re-render the flow. */
export function usePackageAnalytics(): PackageAnalytics {
  const { analytics, eventPrefix, onAnalyticsError } = useContext(AnalyticsContext);

  // Read the error handler through a ref so a host passing an inline arrow
  // doesn't rebuild the wrapper on every render.
  const errorRef = useRef<AnalyticsErrorHandler | undefined>(onAnalyticsError);
  useEffect(() => {
    errorRef.current = onAnalyticsError;
  }, [onAnalyticsError]);

  return useMemo(
    () => guard(analytics, eventPrefix, errorRef),
    [analytics, eventPrefix]
  );
}

function guard(
  impl: PackageAnalytics,
  eventPrefix: string,
  errorRef: React.MutableRefObject<AnalyticsErrorHandler | undefined>
): PackageAnalytics {
  const report = (error: unknown, method: keyof PackageAnalytics) => {
    try {
      errorRef.current?.(error, method);
    } catch {
      // A throwing error handler must not become the thing that breaks us.
    }
  };

  /** Run a call into the host's implementation such that it can never break
   * the library: sync throws are caught, returned promises get a `.catch`
   * attached (so no unhandled rejection), and nothing is ever awaited. */
  const isolate = (method: keyof PackageAnalytics, run: () => unknown) => {
    try {
      const result = run();
      if (result && typeof (result as Promise<void>).catch === 'function') {
        (result as Promise<void>).catch((error: unknown) => report(error, method));
      }
    } catch (error) {
      report(error, method);
    }
  };

  return {
    logEvent: (name, params) => {
      const eventName = prefixEventName(eventPrefix, name);
      if (eventName === null) return;
      const clean = sanitizeParams(params);
      isolate('logEvent', () => impl.logEvent(eventName, clean));
    },
    setUserId: (id) => isolate('setUserId', () => impl.setUserId(id)),
    setProperty: (key, value) => {
      // Property keys follow the same charset rule as event params.
      const clean = sanitizeParams({ [key]: value });
      const cleanKey = Object.keys(clean)[0];
      if (cleanKey === undefined) return;
      isolate('setProperty', () => impl.setProperty(cleanKey, clean[cleanKey]));
    },
    screenView: (screenName) => {
      const clean = sanitizeScreenName(screenName);
      if (clean === null) return;
      isolate('screenView', () => impl.screenView(clean));
    },
  };
}
