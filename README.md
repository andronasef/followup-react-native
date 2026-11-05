# react-native-follow-up

A forced, localized gospel-invitation flow for React Native/Expo apps.

After a configurable number of app opens and a short delay, `FollowUpGate`
shows a dismissible teaser popup that leads into a full-screen, animated
narrative — localized to the visitor's device language (10
languages out of the box, with RTL support for Arabic) — ending in two
response buttons.

Ported from the Flutter [`follow_up`](https://github.com/andronasef/followup-flutter)
package.

## Features

- Configurable trigger: `openThreshold` (default 40) and `delay` (default
  10000ms), tracked per install via `@react-native-async-storage/async-storage`.
- Dismissible teaser popup with snooze: visitors can close the dialog (via
  "✕" button, "Not Right Now", backdrop tap, or Android back button). When dismissed, it
  snoozes and can reappear after `reappearInterval` additional app opens (default 10).
- Full-screen animated flow: SVG illustrations (a cracked globe, falling
  petals, radiating light, a glowing cross, a hand-drawn heart), entrance
  animations, and a "next" button that reveals a couple seconds after each
  scene settles.
- Localized to Arabic, English, Spanish, French, Portuguese, Hindi,
  Mandarin, Russian, Indonesian, and Swahili — auto-detected from the device
  locale via `expo-localization`, with RTL layout for Arabic.
- Final response: an "interested" callback (`onInterested`) and/or a
  built-in contact screen (WhatsApp / Telegram / Messenger / email), or
  "not now" snoozes it for `reappearInterval` additional app opens.
  An interested response stops future prompts for this install.

## Getting started

This package is installed straight from GitHub (it is not on npm). The built
`lib/` is committed, so no build step is needed:

```sh
npm install github:andronasef/followup-react-native
npx expo install react-native-reanimated react-native-svg @react-native-async-storage/async-storage expo-linking expo-localization
```

Pin a release with a tag, e.g. `github:andronasef/followup-react-native#v0.3.0`.

`react-native-reanimated` requires its Babel plugin — add it to your
`babel.config.js` (see the [Reanimated install docs](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)
if you haven't already):

```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],
};
```

## Usage

Wrap your app's home screen in `FollowUpGate`, near your app's root:

```tsx
import { FollowUpGate } from 'react-native-follow-up';

export default function App() {
  return (
    <FollowUpGate
      onInterested={async () => {
        // e.g. navigate to a contact screen, log an event, etc.
      }}
    >
      <MyHomeScreen />
    </FollowUpGate>
  );
}
```

See `example/` for a runnable demo with a debug button to force-trigger the
flow without waiting for 40 real app opens.

## API

```ts
<FollowUpGate
  openThreshold={40}      // app opens before the flow can trigger
  reappearInterval={10}   // opens before dismissed popup reappears
  delay={10000}           // ms to wait after the threshold is hit
  showPopup={true}        // set to false to bypass the popup dialog and open the flow directly
  contactConfigUrl={'https://...'} // where the contact handles come from
  ctaUrl={'https://...'}  // open a URL instead of the contact screen
  onInterested={() => {}} // called on "interested", before either
  analytics={undefined}   // optional; see "Analytics" below
>
  {children}
</FollowUpGate>
```

`FollowUpTracker` (used internally, also exported for QA tooling):
`create()`, `getOpenCount()`, `getHasBeenShown()`, `markShown()`,
`recordOpen()`, `shouldTrigger({ threshold })`, `debugReset()`,
`debugForceReady({ threshold })`.

## Contact screen

The flow ends by handing the visitor off to whichever messaging app they
already use. The handles are fetched at that moment from a hosted JSON file:

```json
{
  "whatsapp": "201234567890",
  "telegram": "yourusername",
  "messenger": "yourpage",
  "email": "you@example.com"
}
```

Every key is optional — omit one and its button doesn't appear. `whatsapp` is
digits only, with the country code and no `+`.

The default is `DEFAULT_CONTACT_CONFIG_URL`
(<https://followup-web-simple.pages.dev/config.json>), which also backs the
web page at <https://followup-web-simple.pages.dev>. Host your own and pass
`contactConfigUrl`.

The last successful fetch is cached in AsyncStorage, so a visitor with no
connection still sees the screen. If there's no cache either, the flow opens
the web page instead — it loads the same config once they're online.

To keep the old behaviour (open a URL instead of the contact screen), set
`ctaUrl`.

## Previewing without waiting

These jump straight to any stage, skipping the open-count threshold and the
delay. They never set the "already shown" flag, so the real gate still fires
later. A `<FollowUpGate>` must be mounted somewhere.

```ts
import { debugShowTeaser, debugShowFlow, debugShowContact, debugReset, debugForceReady }
  from 'react-native-follow-up';

debugShowTeaser({ locale: 'ar' });
debugShowFlow();
debugShowContact({ config: { whatsapp: '201234567890' } });

await debugReset();      // back to a fresh install
await debugForceReady(); // next real mount triggers for real
```

## Analytics

**This package emits events. It never initializes an analytics SDK.**

It has no native dependencies of its own — no `android/` or `ios/` folder, no
podspec, no autolinked native module, no Expo config plugin — so it installs
into an Expo Go project and runs with no prebuild and no development build.

That is deliberate. Microsoft Clarity and Firebase Analytics are both
process-wide native singletons bound to a single project / measurement ID. A
library that initialized one would either silently lose to your app's own
`initialize()` call or make yours lose to it, and would force every consumer
of this package into a development build whether or not they wanted analytics.

So the package defines an interface and emits into it. You supply an
implementation — or you supply nothing, in which case every event goes to
`noopAnalytics` and the flow works exactly the same.

### The interface

```ts
export interface PackageAnalytics {
  logEvent(name: string, params?: Record<string, unknown>): void | Promise<void>;
  setUserId(id: string | null): void | Promise<void>;
  setProperty(key: string, value: string): void | Promise<void>;
  screenView(screenName: string): void | Promise<void>;
}
```

Wire it up either as a prop:

```tsx
<FollowUpGate analytics={myAnalytics}>{children}</FollowUpGate>
```

…or via context, which also covers anything else from this package you render:

```tsx
import { PackageAnalyticsProvider } from 'react-native-follow-up';

<PackageAnalyticsProvider
  analytics={myAnalytics}
  eventPrefix="followup"                 // default
  onAnalyticsError={(err, method) => console.warn(method, err)}
>
  <App />
</PackageAnalyticsProvider>;
```

The `analytics` prop takes precedence over the provider. There is no global
`setAnalytics()` and no module-level singleton — nothing to collide with the
rest of your app.

### Events

Every event is prefixed with `eventPrefix` (default `followup`).

| Event | Params |
| --- | --- |
| `followup_gate_evaluated` | `threshold`, `triggered` |
| `followup_teaser_shown` | `locale` |
| `followup_teaser_learn_more` | — |
| `followup_scene_view` | `scene_index` |
| `followup_scene_advance` | `scene_index` |
| `followup_response` | `interested` |
| `followup_cta_opened` | `url` |

Plus `screenView('followup_teaser')` / `screenView('followup_scene_N')`, and
`setProperty('followup_locale', <language code>)`.

Names and parameters are sanitized before your implementation sees them, at
the strictest common denominator of GA4 and Clarity: names match
`/^[a-z][a-z0-9_]*$/` and are capped at 40 characters, GA4's reserved
`firebase_` / `google_` / `ga_` prefixes are rejected, parameter values are
coerced to strings, trimmed, capped at 100 characters, dropped when empty or
`null`/`undefined`/`NaN`, and limited to 25 per event.

Calls into your implementation are isolated: synchronous throws are caught,
returned promises get a `.catch`, nothing is ever awaited on a render or
navigation path, and analytics never triggers a re-render. Errors are
swallowed unless you pass `onAnalyticsError`.

### Microsoft Clarity adapter

Write this in your app, not in this package. Clarity requires native code, so
it needs a development build or EAS Build — it does **not** run in Expo Go.

```ts
import * as Clarity from '@microsoft/react-native-clarity';
import type { PackageAnalytics } from 'react-native-follow-up';

// Clarity.initialize('<project-id>') belongs in your app's startup, once.

export const clarityAnalytics: PackageAnalytics = {
  logEvent: (name) => {
    Clarity.sendCustomEvent(name);
  },
  setUserId: (id) => {
    // Clarity rejects empty/whitespace strings, so a null id is a no-op
    // rather than a reset.
    if (id) Clarity.setCustomUserId(id);
  },
  setProperty: (k, v) => {
    Clarity.setCustomTag(k, v);
  },
  screenView: (s) => {
    Clarity.setCurrentScreenName(s);
  },
};
```

Clarity has no per-event parameter concept — `sendCustomEvent` takes a name
only — so `params` are dropped here. Send them as tags if you need them.

### Google Analytics (GA4) adapter

`@react-native-firebase/analytics` v26 removed the namespaced `analytics()`
API; these are the modular functions. Note that `logEvent` now returns `void`
synchronously rather than a promise.

```ts
import {
  getAnalytics,
  logEvent,
  logScreenView,
  setUserId,
  setUserProperty,
} from '@react-native-firebase/analytics';
import type { PackageAnalytics } from 'react-native-follow-up';

export const gaAnalytics: PackageAnalytics = {
  logEvent: (name, params) => logEvent(getAnalytics(), name, params),
  setUserId: (id) => setUserId(getAnalytics(), id),
  setProperty: (k, v) => setUserProperty(getAnalytics(), k, v),
  screenView: (s) => logScreenView(getAnalytics(), { screen_name: s, screen_class: s }),
};
```

### Running both at once

`multiAnalytics` fans out to several implementations. Each event reaches each
destination exactly once; a destination that throws or rejects does not stop
the others.

```tsx
import { multiAnalytics } from 'react-native-follow-up';

<FollowUpGate analytics={multiAnalytics([clarityAnalytics, gaAnalytics])}>
  <MyHomeScreen />
</FollowUpGate>;
```

### Screen tracking with expo-router / React Navigation

This package does not own, patch, or import navigation. It reports its own
screens through `screenView`; your app reports the rest from its own
navigator.

```tsx
// expo-router
import { usePathname } from 'expo-router';

function ScreenTracking() {
  const pathname = usePathname();
  useEffect(() => {
    myAnalytics.screenView(pathname);
  }, [pathname]);
  return null;
}
```

```tsx
// @react-navigation/native
<NavigationContainer
  onStateChange={(state) => {
    const route = state && state.routes[state.index];
    if (route) myAnalytics.screenView(route.name);
  }}
>
  {/* ... */}
</NavigationContainer>
```

Runnable versions of both adapters live in
[`example/analytics-adapters.example.tsx`](example/analytics-adapters.example.tsx).
They are examples only and are never imported by this package's source — the
CI check in `scripts/check-bundle-imports.js` fails the build if anything
outside the declared peer dependencies ends up in the published bundle.

## Additional information

Scene copy is original per language, not a literal translation — file an
issue if you spot something that reads awkwardly in a given language.

A few illustration details are simplified relative to the Flutter original
(no cross-platform SVG blur for the cross's glow, an approximated heart
stroke-length rather than a runtime path measurement) — visually close, not
pixel-perfect.
