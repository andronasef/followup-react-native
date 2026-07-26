import AsyncStorage from '@react-native-async-storage/async-storage';
import { FollowUpTracker } from '../src/FollowUpTracker';

describe('FollowUpTracker', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('recordOpen increments once', async () => {
    const tracker = await FollowUpTracker.create();
    const before = await tracker.getOpenCount();
    await tracker.recordOpen();
    expect(await tracker.getOpenCount()).toBe(before + 1);
    // A second call within the same process must not double-count.
    await tracker.recordOpen();
    expect(await tracker.getOpenCount()).toBe(before + 1);
  });

  it('shouldTrigger respects the threshold', async () => {
    const tracker = await FollowUpTracker.create();
    await AsyncStorage.setItem('follow_up_open_count', '39');
    expect(await tracker.shouldTrigger({ threshold: 40 })).toBe(false);
    await AsyncStorage.setItem('follow_up_open_count', '40');
    expect(await tracker.shouldTrigger({ threshold: 40 })).toBe(true);
  });

  it('hasBeenShown suppresses further triggers', async () => {
    const tracker = await FollowUpTracker.create();
    await AsyncStorage.setItem('follow_up_open_count', '100');
    expect(await tracker.shouldTrigger({ threshold: 40 })).toBe(true);
    await tracker.markShown();
    expect(await tracker.getHasBeenShown()).toBe(true);
    expect(await tracker.shouldTrigger({ threshold: 40 })).toBe(false);
  });

  it('debugReset clears state', async () => {
    const tracker = await FollowUpTracker.create();
    await AsyncStorage.setItem('follow_up_open_count', '40');
    await tracker.markShown();
    await tracker.debugReset();
    expect(await tracker.getOpenCount()).toBe(0);
    expect(await tracker.getHasBeenShown()).toBe(false);
  });

  it('debugForceReady sets the count to the threshold', async () => {
    const tracker = await FollowUpTracker.create();
    await tracker.markShown();
    await tracker.debugForceReady({ threshold: 3 });
    expect(await tracker.getOpenCount()).toBe(3);
    expect(await tracker.shouldTrigger({ threshold: 3 })).toBe(true);
  });
});
