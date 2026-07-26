import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { colors } from '../../colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const JITTER = [0.0, -0.16, 0.1, -0.08, 0.14, 0.0];

/** A cracked circle — the world, worn and fractured. The crack widens as
 * `growth` runs 0→1. ponytail: no circular clip-path (jitter*radius stays
 * close enough to the ring), unlike the Dart canvas version. */
export function BrokenWorldIllustration({ growth, size = 108 }: { growth: SharedValue<number>; size?: number }) {
  const center = size / 2;
  const radius = size / 2 - 4;

  const ringProps = useAnimatedProps(() => ({ strokeOpacity: 0.55 * growth.value }), [growth]);

  const crackProps = useAnimatedProps(() => {
    const g = growth.value;
    const n = JITTER.length;
    let d = '';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const y = size * t;
      const x = center + JITTER[i] * radius * g;
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    return { d, strokeOpacity: g };
  }, [growth, size, center, radius]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <AnimatedPath
          d={`M${center - radius},${center} A${radius},${radius} 0 1,0 ${center + radius},${center} A${radius},${radius} 0 1,0 ${center - radius},${center}`}
          stroke={colors.soft}
          strokeWidth={3}
          fill="none"
          animatedProps={ringProps}
        />
        <AnimatedPath stroke={colors.gold} strokeWidth={3.5} strokeLinecap="round" fill="none" animatedProps={crackProps} />
      </Svg>
    </View>
  );
}
