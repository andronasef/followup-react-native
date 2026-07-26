/* eslint-disable */
// @ts-nocheck
/**
 * Reference adapters for `react-native-follow-up`.
 *
 * EXAMPLE ONLY — this file is never imported by the package source, and the
 * SDKs below are not dependencies of the package. Copy what you need into
 * your own app.
 *
 * Both Clarity and Firebase require native code: they need a development
 * build or EAS Build and do NOT run in Expo Go. The package itself stays pure
 * JS and works in Expo Go with no analytics at all.
 *
 * Install in YOUR app, not in the package:
 *   npx expo install @microsoft/react-native-clarity
 *   npx expo install @react-native-firebase/app @react-native-firebase/analytics
 */
import React, { useEffect } from 'react';
import * as Clarity from '@microsoft/react-native-clarity';
import {
  getAnalytics,
  logEvent,
  logScreenView,
  setUserId,
  setUserProperty,
} from '@react-native-firebase/analytics';
import { usePathname } from 'expo-router';
import { FollowUpGate, multiAnalytics } from 'react-native-follow-up';
import type { PackageAnalytics } from 'react-native-follow-up';

// --- Microsoft Clarity -------------------------------------------------------
// Initialize once, in your app's startup — never inside a library.
// Clarity.initialize('<project-id>');

export const clarityAnalytics: PackageAnalytics = {
  // Clarity has no per-event parameter concept; sendCustomEvent takes a name
  // only, so `params` are dropped. Send them as tags if you need them.
  logEvent: (name) => {
    Clarity.sendCustomEvent(name);
  },
  setUserId: (id) => {
    // Clarity rejects empty/whitespace strings (the call returns false and
    // does nothing), so a null id is a no-op rather than a reset.
    if (id) Clarity.setCustomUserId(id);
  },
  setProperty: (key, value) => {
    Clarity.setCustomTag(key, value);
  },
  screenView: (screenName) => {
    Clarity.setCurrentScreenName(screenName);
  },
};

// --- Google Analytics (GA4) --------------------------------------------------
// @react-native-firebase/analytics v26 removed the namespaced `analytics()`
// API. These are the modular functions; `logEvent` returns void synchronously.

export const gaAnalytics: PackageAnalytics = {
  logEvent: (name, params) => logEvent(getAnalytics(), name, params),
  setUserId: (id) => setUserId(getAnalytics(), id),
  setProperty: (key, value) => setUserProperty(getAnalytics(), key, value),
  screenView: (screenName) =>
    logScreenView(getAnalytics(), { screen_name: screenName, screen_class: screenName }),
};

// --- Both at once ------------------------------------------------------------
// Each package event reaches each destination exactly once. A destination that
// throws or rejects does not stop the other.

export const analytics = multiAnalytics([clarityAnalytics, gaAnalytics]);

export function App({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScreenTracking />
      <FollowUpGate analytics={analytics}>{children}</FollowUpGate>
    </>
  );
}

// --- Screen tracking is the host app's job ----------------------------------
// The package reports its own screens via `screenView`; it does not own, patch,
// or import navigation. Wire the rest up from your own navigator.

function ScreenTracking() {
  const pathname = usePathname();
  useEffect(() => {
    analytics.screenView(pathname);
  }, [pathname]);
  return null;
}

// The @react-navigation/native equivalent:
//
//   <NavigationContainer
//     onStateChange={(state) => {
//       const route = state && state.routes[state.index];
//       if (route) analytics.screenView(route.name);
//     }}
//   >
