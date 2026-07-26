export { FollowUpGate } from './FollowUpGate';
export type { FollowUpGateProps } from './FollowUpGate';
export { FollowUpTracker } from './FollowUpTracker';
export type { FollowUpScene, FollowUpStrings, ContactStrings } from './types';

// Contact screen: the end of the flow, with handles loaded from a hosted
// JSON file so they can change without an app release.
export { ContactScreen } from './components/ContactScreen';
export {
  loadContactConfig,
  parseContactConfig,
  availableChannels,
  contactUri,
  debugClearContactCache,
  CONTACT_CHANNELS,
  DEFAULT_CONTACT_CONFIG_URL,
  CONTACT_FALLBACK_PAGE_URL,
} from './contactConfig';
export type { ContactConfig, ContactChannel } from './contactConfig';

// Devtools: jump to any stage without waiting out the open count + delay.
export {
  debugShowTeaser,
  debugShowFlow,
  debugShowContact,
  debugReset,
  debugForceReady,
} from './debug';
export * as SupportedLocales from './locales';

// Analytics. This library emits events but never initializes any analytics
// SDK, and has no native dependencies of its own — see README "Analytics".
export { noopAnalytics } from './analytics/types';
export type { PackageAnalytics, AnalyticsErrorHandler } from './analytics/types';
export { PackageAnalyticsProvider, usePackageAnalytics, DEFAULT_EVENT_PREFIX } from './analytics/AnalyticsProvider';
export type { PackageAnalyticsProviderProps } from './analytics/AnalyticsProvider';
export { multiAnalytics } from './analytics/multi';
