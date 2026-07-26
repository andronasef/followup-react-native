import { useDerivedValue, interpolate, Extrapolation, Easing, type SharedValue } from 'react-native-reanimated';

// ponytail: shared ease-out curve so every fade/slide beat decelerates into
// place instead of moving at the linear rate of the master scene clock.
const BEAT_EASING = Easing.out(Easing.cubic);

/** Derives a 0→1 "beat" from a scene's linear progress value, active only
 * during [start, start+dur] (all in seconds, matching the Flutter port's
 * `_beat(startSeconds, durSeconds)`). Clamped outside that window, eased in. */
export function useBeat(
  progress: SharedValue<number>,
  totalSeconds: number,
  startSeconds: number,
  durSeconds: number
) {
  return useDerivedValue(() => {
    const s = startSeconds / totalSeconds;
    const e = (startSeconds + durSeconds) / totalSeconds;
    const t = interpolate(progress.value, [s, e], [0, 1], Extrapolation.CLAMP);
    return BEAT_EASING(t);
  }, [progress, totalSeconds, startSeconds, durSeconds]);
}
