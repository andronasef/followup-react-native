import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
// ponytail: approximate path length tuned by eye — react-native-svg has no
// synchronous cross-platform getTotalLength() before first paint, unlike
// Flutter's PathMetric.extractPath used by the original.
const APPROX_PATH_LENGTH = 300;

/** A hand-drawn heart outline that traces itself in as `growth` runs 0→1. */
export function HeartOutline({ growth, size = 120 }: { growth: SharedValue<number>; size?: number }) {
  const w = size;
  const h = size;
  const d = `M${w * 0.5},${h * 0.92} C${w * -0.1},${h * 0.55} ${w * 0.08},${h * 0.05} ${w * 0.5},${h * 0.28} C${w * 0.92},${h * 0.05} ${w * 1.1},${h * 0.55} ${w * 0.5},${h * 0.92} Z`;
  const pathLength = size * 3.4;

  const animatedProps = useAnimatedProps(
    () => ({
      strokeDashoffset: pathLength * (1 - growth.value),
    }),
    [growth, pathLength]
  );

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <AnimatedPath
          d={d}
          stroke="#B23A2E"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={pathLength}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}
