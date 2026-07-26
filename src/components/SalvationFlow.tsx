import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import type { FollowUpStrings, FollowUpScene } from '../types';
import { colors } from '../colors';
import { SceneFrame } from './SceneFrame';
import { FadeSlideText } from './FadeSlideText';
import { Fade } from './Fade';
import { ResponseButtons } from './ResponseButtons';
import { SceneDots } from './SceneDots';
import { NextButton } from './NextButton';
import { useBeat } from './useBeat';
import { usePackageAnalytics } from '../analytics/AnalyticsProvider';
import { BrokenWorldIllustration } from './illustrations/BrokenWorldIllustration';
import { FallingPetals } from './illustrations/FallingPetals';
import { LightRays } from './illustrations/LightRays';
import { AnimatedCross } from './illustrations/AnimatedCross';
import { HeartOutline } from './illustrations/HeartOutline';

// Per-scene timing, in seconds: when the "next" affordance / response
// buttons should reveal after the scene's content has settled. Ported
// verbatim from the Flutter package's `_settleSeconds`.
const SETTLE_SECONDS = [2.4, 2.9, 2.1, 3.4, 2.9];
const BUTTON_DELAY_SECONDS = 2.0;
const BUTTON_FADE_SECONDS = 0.5;

function RefLine({ text, isRtl }: { text: string; isRtl: boolean }) {
  return (
    <View style={[styles.refRow, isRtl && styles.refRowRtl]}>
      <View style={styles.rule} />
      <Text style={styles.refText}>{text}</Text>
      <View style={styles.rule} />
    </View>
  );
}

function SceneContent({ sceneIndex, scene, isRtl }: { sceneIndex: number; scene: FollowUpScene; isRtl: boolean }) {
  const totalSeconds = SETTLE_SECONDS[sceneIndex] + BUTTON_DELAY_SECONDS + BUTTON_FADE_SECONDS;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: totalSeconds * 1000, easing: Easing.linear });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount (SalvationFlow remounts this via `key`).
  }, []);

  const textDir = isRtl ? ('rtl' as const) : ('ltr' as const);
  const b = (start: number, dur: number) => useBeat(progress, totalSeconds, start, dur);

  switch (sceneIndex) {
    case 0:
      return (
        <SceneFrame sunOpacity={0.55}>
          <Fade growth={b(0, 0.6)}>
            <BrokenWorldIllustration growth={b(0, 0.6)} />
          </Fade>
          {!!scene.kicker && (
            <FadeSlideText growth={b(0.2, 0.75)} style={styles.gapTop}>
              <Text style={[styles.kicker, { writingDirection: textDir }]}>{scene.kicker}</Text>
            </FadeSlideText>
          )}
          <FadeSlideText growth={b(0.9, 0.75)} style={styles.gapTop}>
            <Text style={[styles.headlineLg, { writingDirection: textDir }]}>{scene.headline}</Text>
          </FadeSlideText>
        </SceneFrame>
      );
    case 1:
      return (
        <SceneFrame ambient={<FallingPetals />}>
          <FadeSlideText growth={b(0.2, 0.75)}>
            <Text style={[styles.headlineMd, { writingDirection: textDir }]}>{scene.headline}</Text>
          </FadeSlideText>
          {!!scene.verse && (
            <FadeSlideText growth={b(1.1, 0.75)} style={styles.gapTop}>
              <Text style={[styles.verse, { writingDirection: textDir }]}>{'“' + scene.verse + '”'}</Text>
            </FadeSlideText>
          )}
          {!!scene.reference && (
            <FadeSlideText growth={b(1.9, 0.7)} style={styles.gapTop}>
              <RefLine text={scene.reference} isRtl={isRtl} />
            </FadeSlideText>
          )}
        </SceneFrame>
      );
    case 2:
      return (
        <SceneFrame sunOpacity={0.6}>
          <Fade growth={b(0, 0.6)}>
            <LightRays growth={b(0, 0.6)} />
          </Fade>
          {!!scene.kicker && (
            <FadeSlideText growth={b(0.2, 0.75)} style={styles.gapSmall}>
              <Text style={[styles.kickerLg, { writingDirection: textDir }]}>{scene.kicker}</Text>
            </FadeSlideText>
          )}
          <FadeSlideText growth={b(1.1, 0.75)} style={styles.gapTop}>
            <Text style={[styles.headlineLg, styles.gold, { writingDirection: textDir }]}>{scene.headline}</Text>
          </FadeSlideText>
        </SceneFrame>
      );
    case 3:
      return (
        <SceneFrame sunOpacity={0.72}>
          <Fade growth={b(0.1, 0.55)}>
            <AnimatedCross growth={b(0.1, 0.55)} />
          </Fade>
          <FadeSlideText growth={b(1.2, 0.75)} style={styles.gapMd}>
            <Text style={[styles.headlineMd, { writingDirection: textDir }]}>{scene.headline}</Text>
          </FadeSlideText>
          {!!scene.verse && (
            <FadeSlideText growth={b(2.0, 0.75)} style={styles.gapTop}>
              <Text style={[styles.verse, { writingDirection: textDir }]}>{'“' + scene.verse + '”'}</Text>
            </FadeSlideText>
          )}
          {!!scene.reference && (
            <FadeSlideText growth={b(2.8, 0.7)} style={styles.gapTop}>
              <RefLine text={scene.reference} isRtl={isRtl} />
            </FadeSlideText>
          )}
        </SceneFrame>
      );
    default:
      return (
        <SceneFrame sunOpacity={0.6}>
          <Fade growth={b(0, 0.7)}>
            <HeartOutline growth={b(0, 0.7)} />
          </Fade>
          <FadeSlideText growth={b(0.2, 0.75)} style={styles.gapMd}>
            <Text style={[styles.headlineLg, { writingDirection: textDir }]}>{scene.headline}</Text>
          </FadeSlideText>
          {!!scene.verse && (
            <FadeSlideText growth={b(1.1, 0.75)} style={styles.gapTop}>
              <Text style={[styles.verseGold, { writingDirection: textDir }]}>{scene.verse}</Text>
            </FadeSlideText>
          )}
        </SceneFrame>
      );
  }
}

function RevealNext({ sceneIndex, onAdvance }: { sceneIndex: number; onAdvance: () => void }) {
  const totalSeconds = SETTLE_SECONDS[sceneIndex] + BUTTON_DELAY_SECONDS + BUTTON_FADE_SECONDS;
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: totalSeconds * 1000, easing: Easing.linear });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const start = SETTLE_SECONDS[sceneIndex] + BUTTON_DELAY_SECONDS;
  const reveal = useBeat(progress, totalSeconds, start, totalSeconds - start);
  return (
    <FadeSlideText growth={reveal}>
      <NextButton onPress={onAdvance} />
    </FadeSlideText>
  );
}

function RevealResponse({
  sceneIndex,
  strings,
  onInterested,
  onNotNow,
}: {
  sceneIndex: number;
  strings: FollowUpStrings;
  onInterested: () => void;
  onNotNow: () => void;
}) {
  const totalSeconds = SETTLE_SECONDS[sceneIndex] + BUTTON_DELAY_SECONDS + BUTTON_FADE_SECONDS;
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: totalSeconds * 1000, easing: Easing.linear });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const start = SETTLE_SECONDS[sceneIndex] + BUTTON_DELAY_SECONDS;
  const reveal = useBeat(progress, totalSeconds, start, totalSeconds - start);
  return (
    <ResponseButtons
      reveal={reveal}
      interestedLabel={strings.interestedButton}
      notNowLabel={strings.notNowButton}
      onInterested={onInterested}
      onNotNow={onNotNow}
    />
  );
}

/** Full-screen narrative: five scenes then a response. Each scene reveals a
 * "next" button 2s after its entrance animation settles; the final scene
 * reveals response buttons instead. Not dismissible — the host FollowUpGate
 * renders this in a Modal with `onRequestClose` swallowed. */
export function SalvationFlow({
  strings,
  isRtl,
  onInterested,
  onNotNow,
}: {
  strings: FollowUpStrings;
  isRtl: boolean;
  onInterested: () => void;
  onNotNow: () => void;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scenes = strings.scenes;
  const isLast = sceneIndex === scenes.length - 1;
  const analytics = usePackageAnalytics();

  // Fires on entry to each scene, including the first. In an effect rather
  // than inline so emitting can never influence a render.
  useEffect(() => {
    analytics.logEvent('scene_view', { scene_index: sceneIndex });
    analytics.screenView(`followup_scene_${sceneIndex}`);
  }, [analytics, sceneIndex]);

  const advance = () => {
    analytics.logEvent('scene_advance', { scene_index: sceneIndex });
    setSceneIndex((i) => (i >= scenes.length - 1 ? i : i + 1));
  };

  return (
    <View style={styles.fill}>
      <SceneContent key={sceneIndex} sceneIndex={sceneIndex} scene={scenes[sceneIndex]} isRtl={isRtl} />
      <View style={styles.dotsWrap} pointerEvents="none">
        <SceneDots count={scenes.length} current={sceneIndex} isRtl={isRtl} />
      </View>
      <View style={styles.bottomWrap}>
        {isLast ? (
          <RevealResponse key={sceneIndex} sceneIndex={sceneIndex} strings={strings} onInterested={onInterested} onNotNow={onNotNow} />
        ) : (
          <RevealNext key={sceneIndex} sceneIndex={sceneIndex} onAdvance={advance} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.gradientTop },
  dotsWrap: { position: 'absolute', top: 56, left: 0, right: 0 },
  bottomWrap: { position: 'absolute', bottom: 64, left: 0, right: 0, alignItems: 'center' },
  gapTop: { marginTop: 20 },
  gapSmall: { marginTop: 8 },
  gapMd: { marginTop: 16 },
  kicker: { fontSize: 20, color: colors.soft, textAlign: 'center' },
  kickerLg: { fontSize: 24, color: colors.ink, textAlign: 'center', lineHeight: 36 },
  headlineLg: { fontSize: 34, fontWeight: '700', color: colors.ink, textAlign: 'center', lineHeight: 44 },
  headlineMd: { fontSize: 32, fontWeight: '700', color: colors.ink, textAlign: 'center', lineHeight: 43 },
  gold: { color: colors.gold },
  verse: { fontSize: 22, color: colors.ink, textAlign: 'center', lineHeight: 33 },
  verseGold: { fontSize: 22, color: colors.gold, fontWeight: '600', textAlign: 'center', lineHeight: 33 },
  refRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  refRowRtl: { flexDirection: 'row-reverse' },
  rule: { width: 40, height: 1, backgroundColor: colors.gold, opacity: 0.5 },
  refText: { fontSize: 16, fontWeight: '500', color: colors.gold, letterSpacing: 1, marginHorizontal: 14 },
});
