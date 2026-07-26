import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../colors';
import { SunGlow } from './SunGlow';

/** Shared warm parchment background + optional sun glow used by every scene
 * in the full-screen flow. */
export function SceneFrame({
  sunOpacity = 0,
  ambient,
  children,
}: {
  sunOpacity?: number;
  /** Full-bleed decorative layer behind the content (e.g. ambient falling
   * petals) — distinct from `sunOpacity`'s centered glow. */
  ambient?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.gradientTop} />
            <Stop offset="1" stopColor={colors.gradientBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
      </Svg>
      {ambient && <View style={StyleSheet.absoluteFill}>{ambient}</View>}
      {sunOpacity > 0 && (
        <View style={styles.sunWrap} pointerEvents="none">
          <SunGlow opacity={sunOpacity} />
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sunWrap: { position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 96 },
});
