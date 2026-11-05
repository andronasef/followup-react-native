import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SalvationFlow } from '../src/components/SalvationFlow';
import { FollowUpGate } from '../src/FollowUpGate';
import { FollowUpTracker } from '../src/FollowUpTracker';
import { PackageAnalyticsProvider } from '../src/analytics/AnalyticsProvider';
import { fakeAnalytics } from './fakeAnalytics';

jest.mock('expo-linking', () => ({ openURL: jest.fn(async () => true) }));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }));

const Child = () => <Text>app content</Text>;

beforeEach(async () => {
  // debugReset (not AsyncStorage.clear) because FollowUpTracker also keeps a
  // module-level "already counted this process" guard that would otherwise
  // make every test after the first one fail to record an open.
  await (await FollowUpTracker.create()).debugReset();
  jest.clearAllMocks();
});

describe('with no analytics at all', () => {
  it('renders children with no provider mounted and never throws', () => {
    render(
      <FollowUpGate openThreshold={999}>
        <Child />
      </FollowUpGate>
    );

    expect(screen.getByText('app content')).toBeTruthy();
  });

  it('runs the full gate -> teaser -> flow path with analytics absent', async () => {
    render(
      <FollowUpGate openThreshold={1} delay={0}>
        <Child />
      </FollowUpGate>
    );

    await waitFor(() => expect(screen.getByText(/Learn More/i)).toBeTruthy());
    fireEvent.press(screen.getByText(/Learn More/i));

    // The flow mounted without a provider — nothing threw, children intact.
    expect(screen.getByText('app content')).toBeTruthy();
  });

  it('bypasses teaser popup and opens flow directly when showPopup is false', async () => {
    render(
      <FollowUpGate openThreshold={1} delay={0} showPopup={false}>
        <Child />
      </FollowUpGate>
    );

    // Flow is opened directly, so "Learn More" teaser button is not rendered
    expect(screen.queryByText(/Learn More/i)).toBeNull();
    // Host app content remains rendered underneath the modal
    expect(screen.getByText('app content')).toBeTruthy();
  });
});

describe('event emission', () => {
  it('emits prefixed, sanitized events for the teaser flow', async () => {
    const fake = fakeAnalytics();

    render(
      <PackageAnalyticsProvider analytics={fake}>
        <FollowUpGate openThreshold={1} delay={0}>
          <Child />
        </FollowUpGate>
      </PackageAnalyticsProvider>
    );

    await waitFor(() => expect(fake.eventNames()).toContain('followup_teaser_shown'));

    expect(fake.eventNames()).toEqual(['followup_gate_evaluated', 'followup_teaser_shown']);
    expect(fake.events()[0][1]).toEqual({ threshold: '1', triggered: 'true' });
    expect(fake.events()[1][1]).toEqual({ locale: 'en' });
    expect(fake.calls).toContainEqual({ method: 'screenView', args: ['followup_teaser'] });
    expect(fake.calls).toContainEqual({ method: 'setProperty', args: ['followup_locale', 'en'] });

    fireEvent.press(screen.getByText(/Learn More/i));

    await waitFor(() => expect(fake.eventNames()).toContain('followup_teaser_learn_more'));
    // Exactly once each — no duplicate delivery.
    expect(fake.eventNames().filter((n) => n === 'followup_teaser_learn_more')).toHaveLength(1);
    expect(fake.eventNames().filter((n) => n === 'followup_teaser_shown')).toHaveLength(1);

    // Entering the flow emits the first scene view.
    await waitFor(() => expect(fake.eventNames()).toContain('followup_scene_view'));
    expect(fake.events().find(([n]) => n === 'followup_scene_view')?.[1]).toEqual({ scene_index: '0' });
  });

  it('reports that the gate did not trigger', async () => {
    const fake = fakeAnalytics();

    render(
      <PackageAnalyticsProvider analytics={fake}>
        <FollowUpGate openThreshold={999} delay={0}>
          <Child />
        </FollowUpGate>
      </PackageAnalyticsProvider>
    );

    await waitFor(() => expect(fake.eventNames()).toContain('followup_gate_evaluated'));
    expect(fake.events()[0][1]).toEqual({ threshold: '999', triggered: 'false' });
    expect(fake.eventNames()).not.toContain('followup_teaser_shown');
  });

  it('lets the analytics prop win over a surrounding provider', async () => {
    const fromContext = fakeAnalytics();
    const fromProp = fakeAnalytics();

    render(
      <PackageAnalyticsProvider analytics={fromContext}>
        <FollowUpGate analytics={fromProp} openThreshold={1} delay={0}>
          <Child />
        </FollowUpGate>
      </PackageAnalyticsProvider>
    );

    await waitFor(() => expect(fromProp.eventNames()).toContain('followup_teaser_shown'));
    expect(fromContext.calls).toHaveLength(0);
    // Overriding must not double-prefix.
    expect(fromProp.eventNames().every((n) => !n.startsWith('followup_followup_'))).toBe(true);
  });

  it('keeps working when the host implementation throws on every call', async () => {
    const fake = fakeAnalytics({ throwOn: ['logEvent', 'screenView', 'setProperty'] });

    render(
      <PackageAnalyticsProvider analytics={fake}>
        <FollowUpGate openThreshold={1} delay={0}>
          <Child />
        </FollowUpGate>
      </PackageAnalyticsProvider>
    );

    await waitFor(() => expect(screen.getByText(/Learn More/i)).toBeTruthy());
    expect(screen.getByText('app content')).toBeTruthy();
  });

  it('closing the teaser popup dismisses it and emits teaser_dismissed', async () => {
    const fake = fakeAnalytics();

    render(
      <PackageAnalyticsProvider analytics={fake}>
        <FollowUpGate openThreshold={1} delay={0}>
          <Child />
        </FollowUpGate>
      </PackageAnalyticsProvider>
    );

    await waitFor(() => expect(fake.eventNames()).toContain('followup_teaser_shown'));

    fireEvent.press(screen.getByLabelText('Close'));

    await waitFor(() => expect(fake.eventNames()).toContain('followup_teaser_dismissed'));
    expect(fake.eventNames()).not.toContain('followup_scene_view');
    expect(screen.queryByText(/Learn More/i)).toBeNull();
  });

  it('dismissing the teaser popup via Not Right Now button dismisses it and emits teaser_dismissed', async () => {
    const fake = fakeAnalytics();

    render(
      <PackageAnalyticsProvider analytics={fake}>
        <FollowUpGate openThreshold={1} delay={0}>
          <Child />
        </FollowUpGate>
      </PackageAnalyticsProvider>
    );

    await waitFor(() => expect(fake.eventNames()).toContain('followup_teaser_shown'));

    fireEvent.press(screen.getByText(/Not Right Now/i));

    await waitFor(() => expect(fake.eventNames()).toContain('followup_teaser_dismissed'));
    expect(fake.eventNames()).not.toContain('followup_scene_view');
    expect(screen.queryByText(/Learn More/i)).toBeNull();
  });
});


describe('deferring the invitation', () => {
  it.each(['Close', 'Not Right Now'])('%s snoozes and allows a later popup', async (action) => {
    const tracker = await FollowUpTracker.create();
    const gate = render(<FollowUpGate openThreshold={1} reappearInterval={10} delay={0}><Child /></FollowUpGate>);
    await waitFor(() => expect(screen.getByText(/Learn More/i)).toBeTruthy());
    fireEvent.press(action === 'Close' ? screen.getByLabelText('Close') : screen.getByText(/Not Right Now/i));
    await waitFor(() => expect(screen.queryByText(/Learn More/i)).toBeNull());
    expect(await tracker.getHasBeenShown()).toBe(false);
    expect(await tracker.getLastDismissedOpen()).toBe(1);
    gate.unmount();

    // Simulate persisted open counts from subsequent process launches.
    await AsyncStorage.setItem('follow_up_open_count', '10');
    expect(await tracker.shouldTrigger({ threshold: 1, reappearInterval: 10 })).toBe(false);
    await AsyncStorage.setItem('follow_up_open_count', '11');
    render(<FollowUpGate openThreshold={1} reappearInterval={10} delay={0}><Child /></FollowUpGate>);
    await waitFor(() => expect(screen.getByText(/Learn More/i)).toBeTruthy());
  });

  it('Not Now in the full flow also snoozes instead of completing the invitation', async () => {
    const tracker = await FollowUpTracker.create();
    const gate = render(<FollowUpGate openThreshold={1} delay={0} showPopup={false}><Child /></FollowUpGate>);
    await waitFor(() => expect(gate.UNSAFE_getByType(SalvationFlow)).toBeTruthy());
    fireEvent(gate.UNSAFE_getByType(SalvationFlow), 'onNotNow');
    await waitFor(() => expect(gate.UNSAFE_queryByType(SalvationFlow)).toBeNull());
    expect(await tracker.getHasBeenShown()).toBe(false);
    expect(await tracker.getLastDismissedOpen()).toBe(1);
    expect(await tracker.shouldTrigger({ threshold: 1 })).toBe(false);
    await AsyncStorage.setItem('follow_up_open_count', '11');
    expect(await tracker.shouldTrigger({ threshold: 1 })).toBe(true);
  });
});
