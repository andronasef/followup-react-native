import React from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

/** Opacity-only fade driven by `growth` — used to fade illustrations in
 * (which animate their own shape/stroke growth separately). */
export function Fade({ growth, children }: { growth: SharedValue<number>; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => ({ opacity: growth.value }), [growth]);
  return <Animated.View style={style}>{children}</Animated.View>;
}
