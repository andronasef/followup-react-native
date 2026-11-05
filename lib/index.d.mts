import React from 'react';

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
interface PackageAnalytics {
    logEvent(name: string, params?: Record<string, unknown>): void | Promise<void>;
    setUserId(id: string | null): void | Promise<void>;
    setProperty(key: string, value: string): void | Promise<void>;
    screenView(screenName: string): void | Promise<void>;
}
/** The default. The library is fully functional with analytics entirely
 * absent — no provider mounted means every emit lands here. */
declare const noopAnalytics: PackageAnalytics;
/** Optional error sink. Errors thrown (or promises rejected) by the host's
 * implementation are swallowed by default; pass `onAnalyticsError` to the
 * provider to observe them. */
type AnalyticsErrorHandler = (error: unknown, method: keyof PackageAnalytics) => void;

interface FollowUpGateProps {
    children: React.ReactNode;
    /** Defaults to 40. */
    openThreshold?: number;
    /** If the visitor closes the teaser or chooses "Not Right Now",
     * how many additional app opens must occur before the popup can reappear.
     * Defaults to 10. */
    reappearInterval?: number;
    /** In milliseconds. Defaults to 10000. */
    delay?: number;
    /** Whether to show the teaser popup before the full-screen flow.
     * Defaults to `true`. If `false`, the flow opens directly without the
     * initial dialog popup. */
    showPopup?: boolean;
    /** Alias for `showPopup`. */
    showTeaser?: boolean;
    /** Set this to open a URL via `expo-linking` when the visitor taps the
     * final "interested" button, instead of showing the built-in
     * `ContactScreen`. Left undefined (the default), the flow ends on the
     * contact screen with the handles from `contactConfigUrl`. */
    ctaUrl?: string | null;
    /** Where `ContactScreen` reads its WhatsApp / Telegram / Messenger / email
     * handles from, so they can change without an app release. Point it at
     * your own hosted JSON to use your own contacts. Ignored when `ctaUrl` is
     * set. */
    contactConfigUrl?: string;
    /** Called when the visitor taps the final "interested" button, if
     * provided. Runs alongside `ctaUrl` when both are set. */
    onInterested?: () => Promise<void> | void;
    /** Optional copy variant override. When omitted, picks randomly across the
     * variants available for the resolved locale. 0 = Unconditional Love,
     * 1 = The Healer, 2 = Forgiveness of Sins. */
    copyVariant?: number;
    /** Optional analytics sink. Takes precedence over any surrounding
     * `PackageAnalyticsProvider`. Omit for no analytics — this library never
     * initializes an analytics SDK and works fine without one. See the
     * "Analytics" section of the README. */
    analytics?: PackageAnalytics;
}
/** Wraps a subtree (typically your app's root screen) and, once the app has
 * been opened `openThreshold` times, waits `delay` and then shows the
 * follow-up popup + flow. Dismissal snoozes it; an interested response stops
 * future prompts for this install. Renders `children` untouched
 * until then. */
declare function FollowUpGate({ analytics, ...props }: FollowUpGateProps): React.JSX.Element;

/** Persists the app-open count and whether the follow-up flow has already
 * been shown to this install. */
declare class FollowUpTracker {
    private constructor();
    static create(): Promise<FollowUpTracker>;
    getOpenCount(): Promise<number>;
    getHasBeenShown(): Promise<boolean>;
    getLastDismissedOpen(): Promise<number | null>;
    markShown(): Promise<void>;
    /** Records that the visitor dismissed the teaser popup, noting the current
     * open count so we can snooze reappearance. */
    recordDismiss(): Promise<void>;
    /** Increments the open counter once per process lifetime. Safe to call on
     * every mount of FollowUpGate. */
    recordOpen(): Promise<void>;
    shouldTrigger(opts: {
        threshold: number;
        reappearInterval?: number;
    }): Promise<boolean>;
    /** Clears all follow-up state. QA-only, not for production use. */
    debugReset(): Promise<void>;
    /** Clears state and pre-sets the open count to `threshold`, so the very
     * next FollowUpGate mount triggers immediately (after its delay). */
    debugForceReady(opts: {
        threshold: number;
    }): Promise<void>;
}

/** One beat of the narrative flow shown in the full-screen flow. */
interface FollowUpScene {
    /** Small line shown above the headline (used mainly on the opening scene). */
    kicker?: string;
    headline: string;
    /** Quoted line, rendered with its citation via `reference` when both are set. */
    verse?: string;
    reference?: string;
}
/** Copy for the contact screen shown after the visitor says they'd like to
 * hear more. The channel names (WhatsApp, Telegram, Messenger) are brand
 * names and stay untranslated — only the hints under them are localized. */
interface ContactStrings {
    title: string;
    intro: string;
    whatsappHint: string;
    telegramHint: string;
    messengerHint: string;
    /** Sits before `emailAction` on one line: "Prefer email? Write to us". */
    emailPrompt: string;
    emailAction: string;
    /** Prefilled message placed in the text input when opening messaging apps or email. */
    prefilledMessage?: string;
}
/** All localized copy for one language: the teaser popup, the two final
 * response buttons, the five narrative scenes, and the contact screen. */
interface FollowUpStrings {
    popupHeadline: string;
    popupBody: string;
    learnMoreButton: string;
    interestedButton: string;
    notNowButton: string;
    scenes: readonly FollowUpScene[];
    contact: ContactStrings;
}

/** One reachable channel on the contact screen, in display order. */
declare const CONTACT_CHANNELS: readonly ["whatsapp", "telegram", "messenger", "email"];
type ContactChannel = (typeof CONTACT_CHANNELS)[number];
/** Where a visitor can reach a real person. Fetched from a small hosted JSON
 * file so the handles can change without shipping an app update — the same
 * file backs the web page at https://followup-web-simple.pages.dev. */
type ContactConfig = Partial<Record<ContactChannel, string>>;
declare const DEFAULT_CONTACT_CONFIG_URL = "https://followup-web-simple.pages.dev/config.json";
/** The page that renders this same config in a browser — the fallback when
 * the JSON can't be fetched *and* nothing was ever cached. */
declare const CONTACT_FALLBACK_PAGE_URL = "https://followup-web-simple.pages.dev/";
/** Ignores anything that isn't a non-blank string, so a malformed or
 * half-edited config degrades to fewer buttons rather than broken links. */
declare function parseContactConfig(raw: unknown): ContactConfig;
/** Channels that actually have a handle, in display order. */
declare function availableChannels(config: ContactConfig): ContactChannel[];
/** Deep link for `channel`, or undefined when it has no handle configured. */
declare function contactUri(config: ContactConfig, channel: ContactChannel, prefilledMessage?: string): string | undefined;
/** Fetches the config, falling back to the last successful fetch when the
 * network is unavailable. Resolves to null only when both fail — the caller
 * then sends the visitor to `CONTACT_FALLBACK_PAGE_URL` instead.
 *
 * Never rejects: a contact screen that can't load is a dead end, but a crash
 * mid-flow is worse. */
declare function loadContactConfig({ url, timeoutMs, }?: {
    url?: string;
    timeoutMs?: number;
}): Promise<ContactConfig | null>;
/** QA-only: drops the cached copy so the next load must hit the network. */
declare function debugClearContactCache(): Promise<void>;

/** The last step of the flow: hand the visitor off to whichever messaging app
 * they already use. Mirrors the web page at
 * https://followup-web-simple.pages.dev and reads the same config. */
declare function ContactScreen({ config, strings, isRtl, onClose, onChannelOpened, }: {
    config: ContactConfig;
    strings: ContactStrings;
    isRtl: boolean;
    /** Fired when the user dismisses the contact screen. */
    onClose?: () => void;
    /** Fired with the channel name when a visitor opens one. Analytics only. */
    onChannelOpened?: (channel: ContactChannel) => void;
}): React.JSX.Element;

/** Shows the teaser popup immediately, skipping the open-count threshold and
 * the delay — so you can look at the UI without opening the app 40 times.
 * Doesn't touch the "already shown" flag, so the real gate still behaves
 * normally afterwards. */
declare function debugShowTeaser(opts?: {
    locale?: string;
}): void;
/** Shows the five-scene flow immediately. */
declare function debugShowFlow(opts?: {
    locale?: string;
}): void;
/** Shows the contact screen immediately. Pass `config` to preview handles
 * without hitting the network. */
declare function debugShowContact(opts?: {
    locale?: string;
    config?: ContactConfig;
}): void;
/** Clears the open count, the "already shown" flag, and the cached contact
 * config, so the next launch behaves like a fresh install. */
declare function debugReset(): Promise<void>;
/** Pretends the app has been opened `threshold` times, so the next
 * `FollowUpGate` mount triggers for real (after its own delay). */
declare function debugForceReady(threshold?: number): Promise<void>;

declare const arVariants: readonly [FollowUpStrings, FollowUpStrings, FollowUpStrings];
declare const ar: FollowUpStrings;

declare const enVariants: readonly [FollowUpStrings, FollowUpStrings, FollowUpStrings];
declare const en: FollowUpStrings;

declare const es: FollowUpStrings;

declare const fr: FollowUpStrings;

declare const pt: FollowUpStrings;

declare const hi: FollowUpStrings;

declare const zh: FollowUpStrings;

declare const ru: FollowUpStrings;

declare const id: FollowUpStrings;

declare const sw: FollowUpStrings;

/** The 10 languages shipped in v1. Copy is original per language (not a
 * literal translation of any single source) but follows the same five-beat
 * arc: the world is broken → God loves us anyway → Christ is the answer →
 * an invitation to respond. Ported verbatim from the Flutter package. */
declare const all: Record<string, FollowUpStrings>;
/** Multi-track variants available per language. Languages with multiple tracks
 * offer different angles (e.g. Unconditional Love, The Healer, Forgiveness). */
declare const allVariants: Record<string, readonly FollowUpStrings[]>;
declare const rtlLanguageCodes: Set<string>;
declare function isRtl(languageCode: string): boolean;
/** Resolves a device language code to the closest supported language,
 * defaulting to English when there's no match.
 *
 * If `variantIndex` is given, it picks that specific track. Otherwise, it
 * picks randomly across the tracks available for that language so different
 * visitors encounter different angles. */
declare function resolve(languageCode: string, variantIndex?: number, random?: () => number): FollowUpStrings;
declare function resolveLanguageCode(languageCode: string): string;

declare const index_all: typeof all;
declare const index_allVariants: typeof allVariants;
declare const index_ar: typeof ar;
declare const index_arVariants: typeof arVariants;
declare const index_en: typeof en;
declare const index_enVariants: typeof enVariants;
declare const index_es: typeof es;
declare const index_fr: typeof fr;
declare const index_hi: typeof hi;
declare const index_id: typeof id;
declare const index_isRtl: typeof isRtl;
declare const index_pt: typeof pt;
declare const index_resolve: typeof resolve;
declare const index_resolveLanguageCode: typeof resolveLanguageCode;
declare const index_rtlLanguageCodes: typeof rtlLanguageCodes;
declare const index_ru: typeof ru;
declare const index_sw: typeof sw;
declare const index_zh: typeof zh;
declare namespace index {
  export { index_all as all, index_allVariants as allVariants, index_ar as ar, index_arVariants as arVariants, index_en as en, index_enVariants as enVariants, index_es as es, index_fr as fr, index_hi as hi, index_id as id, index_isRtl as isRtl, index_pt as pt, index_resolve as resolve, index_resolveLanguageCode as resolveLanguageCode, index_rtlLanguageCodes as rtlLanguageCodes, index_ru as ru, index_sw as sw, index_zh as zh };
}

/** Default prefix: the package's short name, snake_cased. Kept short on
 * purpose — GA4 caps event names at 40 characters and the prefix eats into
 * that budget. */
declare const DEFAULT_EVENT_PREFIX = "followup";
interface PackageAnalyticsProviderProps {
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
declare function PackageAnalyticsProvider({ children, analytics, eventPrefix, onAnalyticsError, }: PackageAnalyticsProviderProps): React.JSX.Element;
/** Returns a sanitized, failure-isolated `PackageAnalytics`.
 *
 * Never throws when no provider is mounted — it returns a guarded
 * `noopAnalytics` instead. Calls are fire-and-forget: nothing is awaited and
 * no state is set, so analytics can never block or re-render the flow. */
declare function usePackageAnalytics(): PackageAnalytics;

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
declare function multiAnalytics(impls: PackageAnalytics[]): PackageAnalytics;

export { type AnalyticsErrorHandler, CONTACT_CHANNELS, CONTACT_FALLBACK_PAGE_URL, type ContactChannel, type ContactConfig, ContactScreen, type ContactStrings, DEFAULT_CONTACT_CONFIG_URL, DEFAULT_EVENT_PREFIX, FollowUpGate, type FollowUpGateProps, type FollowUpScene, type FollowUpStrings, FollowUpTracker, type PackageAnalytics, PackageAnalyticsProvider, type PackageAnalyticsProviderProps, index as SupportedLocales, availableChannels, contactUri, debugClearContactCache, debugForceReady, debugReset, debugShowContact, debugShowFlow, debugShowTeaser, loadContactConfig, multiAnalytics, noopAnalytics, parseContactConfig, usePackageAnalytics };
