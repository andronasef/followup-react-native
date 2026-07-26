import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const PETALS = [
  { xFraction: 0.12, phase: 0.0, size: 8, speed: 1.0 },
  { xFraction: 0.28, phase: 0.35, size: 5, speed: 1.3 },
  { xFraction: 0.5, phase: 0.6, size: 7, speed: 0.9 },
  { xFraction: 0.68, phase: 0.15, size: 6, speed: 1.1 },
  { xFraction: 0.85, phase: 0.5, size: 9, speed: 0.8 },
];

function Petal({ p }: { p: (typeof PETALS)[number] }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 9000 / p.speed, easing: Easing.linear }), -1);
  }, [t, p.speed]);

  const style = useAnimatedStyle(() => {
    const progress = (t.value + p.phase) % 1;
    return {
      left: `${p.xFraction * 100}%`,
      top: `${progress * 100}%`,
      opacity: Math.max(0, Math.sin(progress * Math.PI)) * 0.35,
      transform: [{ rotate: `${progress * 360}deg` }],
    };
  }, [t, p.phase, p.xFraction]);

  return (
    <Animated.View style={[styles.petal, style]}>
      <View style={{ width: p.size, height: p.size * 1.4, borderRadius: p.size, backgroundColor: '#B23A2E' }} />
    </Animated.View>
  );
}

/** A handful of small petals drifting down and fading — ambient sorrow for
 * the "fallen" scene. Loops continuously; not tied to scene entrance. */
export function FallingPetals() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PETALS.map((p, i) => (
        <Petal key={i} p={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ petal: { position: 'absolute' } });
