import React, { useEffect } from 'react';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const RAY_COUNT = 10;

/** Rays of light breaking outward from the center — hope arriving. Rays
 * lengthen as `growth` runs 0→1, then drift in a slow idle rotation. */
export function LightRays({ growth, size = 120 }: { growth: SharedValue<number>; size?: number }) {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 24000, easing: Easing.linear }), -1);
  }, [spin]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }), [spin]);

  const center = size / 2;
  const maxLen = size / 2;

  return (
    <Animated.View style={[{ width: size, height: size }, spinStyle]}>
      <Svg width={size} height={size}>
        {Array.from({ length: RAY_COUNT }).map((_, i) => {
          const angle = (i / RAY_COUNT) * 2 * Math.PI;
          const dx = Math.cos(angle);
          const dy = Math.sin(angle);
          const lenFactor = i % 2 === 0 ? 1.0 : 0.62;
          // eslint-disable-next-line react-hooks/rules-of-hooks -- RAY_COUNT is a fixed constant, so this loop always runs the same number of times every render.
          const animatedProps = useAnimatedProps(() => {
            const g = growth.value;
            const len = maxLen * g * lenFactor;
            const startR = maxLen * 0.28;
            return {
              x1: center + dx * startR,
              y1: center + dy * startR,
              x2: center + dx * (startR + len),
              y2: center + dy * (startR + len),
              strokeOpacity: 0.5 * g,
            };
          }, [growth, maxLen, lenFactor, dx, dy, center]);
          return <AnimatedLine key={i} stroke="#D0674A" strokeWidth={2.5} strokeLinecap="round" animatedProps={animatedProps} />;
        })}
      </Svg>
    </Animated.View>
  );
}
