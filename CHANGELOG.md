# Changelog

## 0.3.0

### Added

- Configurable popup snooze with `reappearInterval` (default: 10 additional app opens), and `showPopup` / `showTeaser` options to open the flow directly.
- Localized copy variants and configurable `copyVariant` selection.
- Close controls on the contact screen and a "Not Right Now" button on the teaser.
- Localized prefilled contact messages.

### Changed

- Distributed via GitHub (`npm install github:andronasef/followup-react-native`); built `lib/` is now committed.

- Closing the popup defers the invitation; choosing "Not Right Now" also snoozes it instead of permanently suppressing future prompts.
- Updated the invitation scenes and contact messages across supported locales.

### Fixed

- Preserve eligibility after dismissal and show the popup again when the configured interval is reached.


## 0.2.0

The flow now ends on a contact screen instead of an external link, with
handles loaded from a hosted config file.

### Added

- `<ContactScreen>` — WhatsApp, Telegram, Messenger, email. Same warm
  parchment styling as the scenes, localized to all 10 languages, RTL-aware.
  Shown automatically when the visitor taps "interested".
- `loadContactConfig()`, `parseContactConfig()`, `availableChannels()`,
  `contactUri()`, `DEFAULT_CONTACT_CONFIG_URL`, `CONTACT_FALLBACK_PAGE_URL`.
  Handles come from a hosted JSON file, so the number you're reachable on can
  change without an app update. The last good fetch is cached in
  AsyncStorage; with no cache and no network the flow opens the web page,
  which loads the same config itself.
- `contactConfigUrl` prop on `FollowUpGate` to point at your own JSON.
- `debugShowTeaser()`, `debugShowFlow()`, `debugShowContact()`,
  `debugReset()`, `debugForceReady()` — jump straight to any stage without
  waiting out 40 app opens and the delay. Never marks the flow as shown, so
  the real gate still fires afterwards.
- `ContactStrings` on `FollowUpStrings`, and events `contact_shown`,
  `contact_channel_opened` (`channel`), `contact_fallback_url`.

### Changed

- Distributed via GitHub (`npm install github:andronasef/followup-react-native`); built `lib/` is now committed.

- **Breaking:** `ctaUrl` now defaults to undefined (contact screen) rather
  than a hardcoded link, and `DEFAULT_CTA_URL` is no longer exported. Set
  `ctaUrl` explicitly to keep opening a URL.
- **Breaking:** `FollowUpStrings` gains a required `contact` field. Only
  affects code that builds `FollowUpStrings` by hand.

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

- Distributed via GitHub (`npm install github:andronasef/followup-react-native`); built `lib/` is now committed.

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
