# Changelog

## 0.1.0

Analytics support — the package now emits events, and never initializes an
analytics SDK.

### Added

- `PackageAnalytics` interface, `noopAnalytics` (the default), and
  `multiAnalytics()` for fanning out to several destinations at once.
- `<PackageAnalyticsProvider analytics eventPrefix onAnalyticsError>` and the
  `usePackageAnalytics()` hook. The hook returns `noopAnalytics` when no
  provider is mounted — it never throws, because analytics is optional.
- `analytics` prop on `FollowUpGate`, which takes precedence over the
  provider.
- Events for the whole flow, prefixed `followup_` by default:
  `gate_evaluated`, `teaser_shown`, `teaser_learn_more`, `scene_view`,
  `scene_advance`, `response`, `cta_opened` — plus `screenView` per screen and
  a `followup_locale` user property.
- Event/parameter sanitization at the strictest common denominator of GA4 and
  Clarity: `/^[a-z][a-z0-9_]*$/` names capped at 40 chars, GA4-reserved
  `firebase_`/`google_`/`ga_` prefixes rejected, values stringified, trimmed
  and capped at 100 chars, 25 params per event.
- Failure isolation around every call into the host's implementation: sync
  throws caught, returned promises `.catch`-ed, nothing awaited on a render or
  navigation path, no analytics-triggered re-renders.
- README "Analytics" section with Microsoft Clarity and GA4 adapters, plus an
  expo-router / React Navigation screen-tracking note. Runnable versions live
  in `example/analytics-adapters.example.tsx`.
- `scripts/check-bundle-imports.js` and `scripts/check-no-native.js`, run in
  CI, asserting the published bundle imports nothing outside the declared peer
  dependencies and that the package declares no native code.

### Changed

- `"sideEffects": false` so bundlers can tree-shake the package.
- Test suite moved from `ts-jest`/node to the `react-native` jest preset with
  `@testing-library/react-native`, so components can actually be rendered.

### Notes

- No analytics SDK is a dependency or a peer dependency. The package stays
  pure JS with no native module, no podspec and no Expo config plugin, so it
  installs into Expo Go with no prebuild.

## 0.0.1

Initial release: `FollowUpGate` popup + full-screen animated flow, localized
to 10 languages, ported from the Flutter `follow_up` package.
