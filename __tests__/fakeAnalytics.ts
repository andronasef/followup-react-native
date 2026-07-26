import type { PackageAnalytics } from '../src/analytics/types';

export interface RecordedCall {
  method: keyof PackageAnalytics;
  args: unknown[];
}

export interface FakeAnalytics extends PackageAnalytics {
  calls: RecordedCall[];
  /** Every `logEvent` call, as `[name, params]` pairs. */
  events(): Array<[string, Record<string, string>]>;
  eventNames(): string[];
  reset(): void;
}

export interface FakeAnalyticsOptions {
  /** Make these methods throw synchronously, to prove failure isolation. */
  throwOn?: Array<keyof PackageAnalytics>;
  /** Make these methods return a rejected promise. */
  rejectOn?: Array<keyof PackageAnalytics>;
}

/** A recorder implementing `PackageAnalytics`. Calls are recorded *before* any
 * configured failure, so tests can assert both that the call arrived and that
 * the failure didn't escape. */
export function fakeAnalytics(options: FakeAnalyticsOptions = {}): FakeAnalytics {
  const throwOn = new Set(options.throwOn ?? []);
  const rejectOn = new Set(options.rejectOn ?? []);
  const calls: RecordedCall[] = [];

  const record = (method: keyof PackageAnalytics, ...args: unknown[]) => {
    calls.push({ method, args });
    if (throwOn.has(method)) throw new Error(`fakeAnalytics: ${method} threw`);
    if (rejectOn.has(method)) return Promise.reject(new Error(`fakeAnalytics: ${method} rejected`));
    return undefined;
  };

  return {
    calls,
    logEvent: (name, params) => record('logEvent', name, params),
    setUserId: (id) => record('setUserId', id),
    setProperty: (key, value) => record('setProperty', key, value),
    screenView: (screenName) => record('screenView', screenName),
    events() {
      return calls
        .filter((c) => c.method === 'logEvent')
        .map((c) => [c.args[0] as string, (c.args[1] ?? {}) as Record<string, string>]);
    },
    eventNames() {
      return calls.filter((c) => c.method === 'logEvent').map((c) => c.args[0] as string);
    },
    reset() {
      calls.length = 0;
    },
  };
}
