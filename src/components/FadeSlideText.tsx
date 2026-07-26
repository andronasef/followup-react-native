import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

/** Fades and slides `children` in as `growth` runs 0→1, then holds at rest. */
export function FadeSlideText({
  growth,
  slideFrom = 24,
  style,
  children,
}: {
  growth: SharedValue<number>;
  slideFrom?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const animStyle = useAnimatedStyle(
    () => ({
      opacity: growth.value,
      transform: [{ translateY: (1 - growth.value) * slideFrom }],
    }),
    [growth, slideFrom]
  );
  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}
