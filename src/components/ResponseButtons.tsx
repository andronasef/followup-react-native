import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedReaction, runOnJS, type SharedValue } from 'react-native-reanimated';
import { colors } from '../colors';

/** The final scene's two outcomes: interested, or not right now. Both
 * buttons stay disabled until the reveal animation passes 0.05. */
export function ResponseButtons({
  reveal,
  interestedLabel,
  notNowLabel,
  onInterested,
  onNotNow,
}: {
  reveal: SharedValue<number>;
  interestedLabel: string;
  notNowLabel: string;
  onInterested: () => void;
  onNotNow: () => void;
}) {
  const [ready, setReady] = useState(false);

  useAnimatedReaction(
    () => reveal.value > 0.05,
    (isReady, prevReady) => {
      if (isReady !== prevReady) runOnJS(setReady)(isReady);
    },
    [reveal]
  );

  const style = useAnimatedStyle(
    () => ({
      opacity: reveal.value,
      transform: [{ translateY: (1 - reveal.value) * 16 }],
    }),
    [reveal]
  );

  return (
    <Animated.View style={[styles.wrap, style]}>
      <Pressable
        disabled={!ready}
        onPress={onInterested}
        style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
      >
        <Text style={styles.primaryText}>{interestedLabel}</Text>
      </Pressable>
      <Pressable
        disabled={!ready}
        onPress={onNotNow}
        style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
        hitSlop={8}
      >
        <Text style={styles.secondaryText}>{notNowLabel}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  primary: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 40,
    paddingVertical: 18,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  primaryPressed: { transform: [{ scale: 0.96 }], opacity: 0.9 },
  primaryText: { color: colors.buttonText, fontSize: 18, fontWeight: '700' },
  secondary: { marginTop: 14, paddingVertical: 8 },
  secondaryPressed: { opacity: 0.6 },
  secondaryText: { color: colors.soft, fontSize: 15, fontWeight: '500' },
});
