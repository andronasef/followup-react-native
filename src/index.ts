export { FollowUpGate, DEFAULT_CTA_URL } from './FollowUpGate';
export type { FollowUpGateProps } from './FollowUpGate';
export { FollowUpTracker } from './FollowUpTracker';
export type { FollowUpScene, FollowUpStrings } from './types';
export * as SupportedLocales from './locales';

// Analytics. This library emits events but never initializes any analytics
// SDK, and has no native dependencies of its own — see README "Analytics".
export { noopAnalytics } from './analytics/types';
export type { PackageAnalytics, AnalyticsErrorHandler } from './analytics/types';
export { PackageAnalyticsProvider, usePackageAnalytics, DEFAULT_EVENT_PREFIX } from './analytics/AnalyticsProvider';
export type { PackageAnalyticsProviderProps } from './analytics/AnalyticsProvider';
export { multiAnalytics } from './analytics/multi';
