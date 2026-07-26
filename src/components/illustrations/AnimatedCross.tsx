import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** A glowing gold cross that grows in as `growth` runs 0→1 — the "Christ"
 * scene's centerpiece. ponytail: skips the Dart version's separate blurred
 * glow layer (cross-platform SVG blur is inconsistent); the gradient fill
 * alone approximates it. */
export function AnimatedCross({ growth, height = 220 }: { growth: SharedValue<number>; height?: number }) {
  const width = height * 0.62;
  const thickness = height * 0.11;

  const vProps = useAnimatedProps(() => {
    const barHeight = height * growth.value;
    return { x: width / 2 - thickness / 2, y: height - barHeight, width: thickness, height: barHeight };
  }, [growth, height, width, thickness]);

  const hProps = useAnimatedProps(() => {
    const barWidth = width * growth.value;
    return { x: width / 2 - barWidth / 2, y: height * 0.3 - thickness / 2, width: barWidth, height: thickness };
  }, [growth, height, width, thickness]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D0674A" />
            <Stop offset="1" stopColor="#B23A2E" />
          </LinearGradient>
        </Defs>
        <AnimatedRect animatedProps={vProps} rx={thickness / 2} fill="url(#bar)" />
        <AnimatedRect animatedProps={hProps} rx={thickness / 2} fill="url(#bar)" />
      </Svg>
    </View>
  );
}
