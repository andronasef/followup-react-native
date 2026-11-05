import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';
import * as Linking from 'expo-linking';
import * as Localization from 'expo-localization';
import { FollowUpTracker } from './FollowUpTracker';
import { resolve, isRtl as resolveIsRtl } from './locales';
import { TeaserPopup } from './components/TeaserPopup';
import { SalvationFlow } from './components/SalvationFlow';
import { ContactScreen } from './components/ContactScreen';
import {
  CONTACT_FALLBACK_PAGE_URL,
  DEFAULT_CONTACT_CONFIG_URL,
  loadContactConfig,
  type ContactConfig,
} from './contactConfig';
import type { FollowUpStrings } from './types';
import { PackageAnalyticsProvider, usePackageAnalytics } from './analytics/AnalyticsProvider';
import type { PackageAnalytics } from './analytics/types';
import { subscribeToDebugTriggers } from './debug';

export interface FollowUpGateProps {
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

type Stage = 'idle' | 'teaser' | 'flow' | 'contact';

/** Wraps a subtree (typically your app's root screen) and, once the app has
 * been opened `openThreshold` times, waits `delay` and then shows the
 * follow-up popup + flow. Dismissal snoozes it; an interested response stops
 * future prompts for this install. Renders `children` untouched
 * until then. */
export function FollowUpGate({ analytics, ...props }: FollowUpGateProps) {
  // The `analytics` prop wins over context. Re-providing (rather than
  // wrapping in place) keeps `usePackageAnalytics` as the single place that
  // applies the prefix, so events can't get double-prefixed.
  if (!analytics) return <Gate {...props} />;
  return (
    <PackageAnalyticsProvider analytics={analytics}>
      <Gate {...props} />
    </PackageAnalyticsProvider>
  );
}

function Gate({
  children,
  openThreshold = 40,
  reappearInterval = 10,
  delay = 10000,
  showPopup = true,
  showTeaser,
  copyVariant,
  ctaUrl,
  contactConfigUrl = DEFAULT_CONTACT_CONFIG_URL,
  onInterested,
}: Omit<FollowUpGateProps, 'analytics'>) {
  const [stage, setStage] = useState<Stage>('idle');
  const [strings, setStrings] = useState<FollowUpStrings | null>(null);
  const [rtl, setRtl] = useState(false);
  const [contact, setContact] = useState<ContactConfig | null>(null);
  const trackerRef = useRef<FollowUpTracker | null>(null);
  const mountedRef = useRef(true);

  const analytics = usePackageAnalytics();
  // The mount effect deliberately runs once, so it reads analytics through a
  // ref rather than taking it as a dependency.
  const analyticsRef = useRef(analytics);
  analyticsRef.current = analytics;

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      const tracker = await FollowUpTracker.create();
      trackerRef.current = tracker;
      await tracker.recordOpen();
      if (!mountedRef.current) return;

      const shouldTrigger = await tracker.shouldTrigger({
        threshold: openThreshold,
        reappearInterval,
      });
      analyticsRef.current.logEvent('gate_evaluated', {
        threshold: openThreshold,
        triggered: shouldTrigger,
      });
      if (!shouldTrigger) return;

      await new Promise<void>((r) => setTimeout(() => r(), delay));
      if (!mountedRef.current) return;

      const languageCode = Localization.getLocales()[0]?.languageCode ?? 'en';
      setStrings(resolve(languageCode, copyVariant));
      setRtl(resolveIsRtl(languageCode));

      const shouldShowPopup = showPopup && (showTeaser ?? true);
      analyticsRef.current.setProperty('followup_locale', languageCode);

      if (shouldShowPopup) {
        setStage('teaser');
        analyticsRef.current.logEvent('teaser_shown', { locale: languageCode });
        analyticsRef.current.screenView('followup_teaser');
      } else {
        setStage('flow');
      }
    })();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally runs once per mount, mirroring the Dart port's initState.
  }, []);

  // Lets `debugShowTeaser()` / `debugShowFlow()` / `debugShowContact()` jump
  // straight to a stage without the open-count threshold or the delay. These
  // never mark the flow as shown, so the real gate still behaves normally
  // afterwards.
  useEffect(
    () =>
      subscribeToDebugTriggers(async ({ stage: target, locale, config }) => {
        const languageCode = locale ?? Localization.getLocales()[0]?.languageCode ?? 'en';
        setStrings(resolve(languageCode, copyVariant));
        setRtl(resolveIsRtl(languageCode));

        if (target !== 'contact') {
          setStage(target);
          return;
        }
        const resolved = config ?? (await loadContactConfig({ url: contactConfigUrl }));
        if (!mountedRef.current) return;
        if (!resolved) {
          console.warn(`follow_up: no contact config available from ${contactConfigUrl}`);
          return;
        }
        setContact(resolved);
        setStage('contact');
      }),
    [contactConfigUrl]
  );

  const dismissTeaser = async () => {
    await trackerRef.current?.recordDismiss();
    analytics.logEvent('teaser_dismissed');
    setStage('idle');
  };

  const respond = async (interested: boolean) => {
    analytics.logEvent('response', { interested });
    if (!interested) {
      await trackerRef.current?.recordDismiss();
      setStage('idle');
      return;
    }
    await trackerRef.current?.markShown();
    await onInterested?.();

    if (ctaUrl) {
      setStage('idle');
      await Linking.openURL(ctaUrl);
      analytics.logEvent('cta_opened', { url: ctaUrl });
      return;
    }

    const config = await loadContactConfig({ url: contactConfigUrl });
    if (!mountedRef.current) return;

    // No config and nothing cached — send them to the web page, which loads
    // the same handles itself once they have a connection.
    if (!config) {
      setStage('idle');
      analytics.logEvent('contact_fallback_url');
      await Linking.openURL(CONTACT_FALLBACK_PAGE_URL);
      return;
    }

    setContact(config);
    setStage('contact');
    analytics.logEvent('contact_shown');
    analytics.screenView('followup_contact');
  };

  return (
    <>
      {children}
      {strings && stage === 'teaser' && (
        <Modal visible transparent animationType="fade" onRequestClose={dismissTeaser}>
          <TeaserPopup
            strings={strings}
            isRtl={rtl}
            onClose={dismissTeaser}
            onLearnMore={() => {
              analytics.logEvent('teaser_learn_more');
              setStage('flow');
            }}
          />
        </Modal>
      )}
      {strings && stage === 'flow' && (
        <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={() => {}}>
          <SalvationFlow strings={strings} isRtl={rtl} onInterested={() => respond(true)} onNotNow={() => respond(false)} />
        </Modal>
      )}
      {strings && contact && stage === 'contact' && (
        // Dismissible, unlike the flow — by this point the visitor has already
        // answered, and trapping someone who wanted to talk defeats the point.
        <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setStage('idle')}>
          <ContactScreen
            config={contact}
            strings={strings.contact}
            isRtl={rtl}
            onClose={() => setStage('idle')}
            onChannelOpened={(channel) => analytics.logEvent('contact_channel_opened', { channel })}
          />
        </Modal>
      )}
    </>
  );
}
