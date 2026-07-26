import AsyncStorage from '@react-native-async-storage/async-storage';

const OPEN_COUNT_KEY = 'follow_up_open_count';
const SHOWN_KEY = 'follow_up_shown';

/** Guards against double-counting an open across re-renders within the same
 * process lifetime — module-level, mirroring the Dart port's static guard. */
let recordedThisSession = false;

/** Persists the app-open count and whether the follow-up flow has already
 * been shown to this install. */
export class FollowUpTracker {
  private constructor() {}

  static async create(): Promise<FollowUpTracker> {
    return new FollowUpTracker();
  }

  async getOpenCount(): Promise<number> {
    const raw = await AsyncStorage.getItem(OPEN_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  }

  async getHasBeenShown(): Promise<boolean> {
    return (await AsyncStorage.getItem(SHOWN_KEY)) === 'true';
  }

  async markShown(): Promise<void> {
    await AsyncStorage.setItem(SHOWN_KEY, 'true');
  }

  /** Increments the open counter once per process lifetime. Safe to call on
   * every mount of FollowUpGate. */
  async recordOpen(): Promise<void> {
    if (recordedThisSession) return;
    recordedThisSession = true;
    const count = await this.getOpenCount();
    await AsyncStorage.setItem(OPEN_COUNT_KEY, String(count + 1));
  }

  async shouldTrigger(opts: { threshold: number }): Promise<boolean> {
    const [shown, count] = await Promise.all([this.getHasBeenShown(), this.getOpenCount()]);
    return !shown && count >= opts.threshold;
  }

  /** Clears all follow-up state. QA-only, not for production use. */
  async debugReset(): Promise<void> {
    recordedThisSession = false;
    await AsyncStorage.multiRemove([OPEN_COUNT_KEY, SHOWN_KEY]);
  }

  /** Clears state and pre-sets the open count to `threshold`, so the very
   * next FollowUpGate mount triggers immediately (after its delay). */
  async debugForceReady(opts: { threshold: number }): Promise<void> {
    await this.debugReset();
    await AsyncStorage.setItem(OPEN_COUNT_KEY, String(opts.threshold));
  }
}
