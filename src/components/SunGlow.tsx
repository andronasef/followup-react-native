import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

/** Soft radiant glow used behind the opening/hope/christ scenes. Gently
 * pulses (6s ease-in-out reverse loop, scale 0.94-1.06) to keep the frame
 * alive while the visitor reads. */
export function SunGlow({ opacity = 0.6, size = 380 }: { opacity?: number; size?: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [t]);

  const style = useAnimatedStyle(
    () => ({
      transform: [{ scale: 0.94 + t.value * 0.12 }],
    }),
    [t]
  );

  return (
    <Animated.View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFD6B4" stopOpacity={opacity} />
            <Stop offset="0.42" stopColor="#D25F42" stopOpacity={opacity * 0.4} />
            <Stop offset="0.7" stopColor="#D25F42" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#glow)" />
      </Svg>
    </Animated.View>
  );
}

/** Puts a SunGlow directly behind child, centered on it.
 *
 * The glow is laid out with negative margins from the center, so a halo far larger
 * than the illustration never changes the surrounding layout — it
 * just bleeds out around the art and tracks it wherever the scene lands.
 */
export function GlowingIllustration({
  glowOpacity = 0.6,
  glowSize = 380,
  illustrationSize = 120,
  children,
}: {
  glowOpacity?: number;
  glowSize?: number;
  /** Size of illustration footprint (defaults to 120). */
  illustrationSize?: number;
  children: React.ReactNode;
}) {
  if (glowOpacity <= 0) return <>{children}</>;
  const offset = (illustrationSize - glowSize) / 2;
  return (
    <View
      style={{
        width: illustrationSize,
        height: illustrationSize,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: offset,
          left: offset,
          width: glowSize,
          height: glowSize,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SunGlow opacity={glowOpacity} size={glowSize} />
      </View>
      {children}
    </View>
  );
}
