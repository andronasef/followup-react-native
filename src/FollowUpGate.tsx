import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';
import * as Linking from 'expo-linking';
import * as Localization from 'expo-localization';
import { FollowUpTracker } from './FollowUpTracker';
import { resolve, isRtl as resolveIsRtl } from './locales';
import { TeaserPopup } from './components/TeaserPopup';
import { SalvationFlow } from './components/SalvationFlow';
import type { FollowUpStrings } from './types';
import { PackageAnalyticsProvider, usePackageAnalytics } from './analytics/AnalyticsProvider';
import type { PackageAnalytics } from './analytics/types';

/** Opened via `expo-linking` when the visitor taps the final "interested"
 * button. Pass your own URL to override, or `null` to disable the URL
 * launch entirely (e.g. when relying solely on `onInterested`). */
export const DEFAULT_CTA_URL = 'https://andronasef.github.io/links/19';

export interface FollowUpGateProps {
  children: React.ReactNode;
  /** Defaults to 40. */
  openThreshold?: number;
  /** In milliseconds. Defaults to 10000. */
  delay?: number;
  ctaUrl?: string | null;
  /** Called when the visitor taps the final "interested" button, if
   * provided. Runs alongside `ctaUrl` when both are set. */
  onInterested?: () => Promise<void> | void;
  /** Optional analytics sink. Takes precedence over any surrounding
   * `PackageAnalyticsProvider`. Omit for no analytics — this library never
   * initializes an analytics SDK and works fine without one. See the
   * "Analytics" section of the README. */
  analytics?: PackageAnalytics;
}

type Stage = 'idle' | 'teaser' | 'flow';

/** Wraps a subtree (typically your app's root screen) and, once the app has
 * been opened `openThreshold` times, waits `delay` and then shows the
 * follow-up popup + flow — once per install. Renders `children` untouched
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

function Gate({ children, openThreshold = 40, delay = 10000, ctaUrl = DEFAULT_CTA_URL, onInterested }: Omit<FollowUpGateProps, 'analytics'>) {
  const [stage, setStage] = useState<Stage>('idle');
  const [strings, setStrings] = useState<FollowUpStrings | null>(null);
  const [rtl, setRtl] = useState(false);
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

      const shouldTrigger = await tracker.shouldTrigger({ threshold: openThreshold });
      analyticsRef.current.logEvent('gate_evaluated', {
        threshold: openThreshold,
        triggered: shouldTrigger,
      });
      if (!shouldTrigger) return;

      await new Promise<void>((r) => setTimeout(() => r(), delay));
      if (!mountedRef.current) return;

      const languageCode = Localization.getLocales()[0]?.languageCode ?? 'en';
      setStrings(resolve(languageCode));
      setRtl(resolveIsRtl(languageCode));
      setStage('teaser');

      analyticsRef.current.setProperty('followup_locale', languageCode);
      analyticsRef.current.logEvent('teaser_shown', { locale: languageCode });
      analyticsRef.current.screenView('followup_teaser');
    })();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally runs once per mount, mirroring the Dart port's initState.
  }, []);

  const respond = async (interested: boolean) => {
    analytics.logEvent('response', { interested });
    await trackerRef.current?.markShown();
    setStage('idle');
    if (!interested) return;
    await onInterested?.();
    if (!ctaUrl) return;
    await Linking.openURL(ctaUrl);
    analytics.logEvent('cta_opened', { url: ctaUrl });
  };

  return (
    <>
      {children}
      {strings && stage === 'teaser' && (
        <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
          <TeaserPopup
            strings={strings}
            isRtl={rtl}
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
    </>
  );
}
