import React from 'react';
import { Text } from 'react-native';
import { render, renderHook } from '@testing-library/react-native';
import {
  PackageAnalyticsProvider,
  usePackageAnalytics,
} from '../src/analytics/AnalyticsProvider';
import { multiAnalytics } from '../src/analytics/multi';
import { noopAnalytics } from '../src/analytics/types';
import type { AnalyticsErrorHandler, PackageAnalytics } from '../src/analytics/types';
import { fakeAnalytics } from './fakeAnalytics';

function wrapper(props: {
  analytics?: PackageAnalytics;
  eventPrefix?: string;
  onAnalyticsError?: AnalyticsErrorHandler;
}) {
  return ({ children }: { children: React.ReactNode }) => (
    <PackageAnalyticsProvider {...props}>{children}</PackageAnalyticsProvider>
  );
}

describe('usePackageAnalytics with no provider mounted', () => {
  it('returns a usable instance instead of throwing', () => {
    const { result } = renderHook(() => usePackageAnalytics());

    expect(result.current).toBeDefined();
    expect(() => {
      result.current.logEvent('teaser_shown', { locale: 'en' });
      result.current.setUserId('u1');
      result.current.setProperty('locale', 'en');
      result.current.screenView('followup_teaser');
    }).not.toThrow();
  });

  it('renders a consuming component without warnings', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    function Consumer() {
      usePackageAnalytics();
      return <Text>ok</Text>;
    }
    const { getByText } = render(<Consumer />);

    expect(getByText('ok')).toBeTruthy();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    warn.mockRestore();
    error.mockRestore();
  });
});

describe('event naming', () => {
  it('prefixes every event with the default prefix', () => {
    const fake = fakeAnalytics();
    const { result } = renderHook(() => usePackageAnalytics(), { wrapper: wrapper({ analytics: fake }) });

    result.current.logEvent('teaser_shown');

    expect(fake.eventNames()).toEqual(['followup_teaser_shown']);
  });

  it('honours a custom eventPrefix', () => {
    const fake = fakeAnalytics();
    const { result } = renderHook(() => usePackageAnalytics(), {
      wrapper: wrapper({ analytics: fake, eventPrefix: 'pkg' }),
    });

    result.current.logEvent('teaser_shown');

    expect(fake.eventNames()).toEqual(['pkg_teaser_shown']);
  });

  it('sanitizes before the implementation ever sees the event', () => {
    const fake = fakeAnalytics();
    const { result } = renderHook(() => usePackageAnalytics(), { wrapper: wrapper({ analytics: fake }) });

    result.current.logEvent('Scene Advance', {
      'Scene Index': 2,
      dropped: null,
      empty: '   ',
      long: 'x'.repeat(250),
    });

    const [name, params] = fake.events()[0];
    expect(name).toBe('followup_scene_advance');
    expect(params.scene_index).toBe('2');
    expect(params).not.toHaveProperty('dropped');
    expect(params).not.toHaveProperty('empty');
    expect(params.long).toHaveLength(100);
  });

  it('drops an event whose prefixed name is GA4-reserved rather than sending it', () => {
    const fake = fakeAnalytics();
    const { result } = renderHook(() => usePackageAnalytics(), {
      wrapper: wrapper({ analytics: fake, eventPrefix: 'ga' }),
    });

    result.current.logEvent('teaser_shown');

    expect(fake.calls).toHaveLength(0);
  });

  it('does not prefix screen names', () => {
    const fake = fakeAnalytics();
    const { result } = renderHook(() => usePackageAnalytics(), { wrapper: wrapper({ analytics: fake }) });

    result.current.screenView('  Home  ');

    expect(fake.calls).toEqual([{ method: 'screenView', args: ['Home'] }]);
  });

  it('skips a screenView that Clarity would reject as empty', () => {
    const fake = fakeAnalytics();
    const { result } = renderHook(() => usePackageAnalytics(), { wrapper: wrapper({ analytics: fake }) });

    result.current.screenView('   ');

    expect(fake.calls).toHaveLength(0);
  });
});

describe('failure isolation', () => {
  it('swallows a synchronous throw from the host implementation', () => {
    const fake = fakeAnalytics({ throwOn: ['logEvent'] });
    const { result } = renderHook(() => usePackageAnalytics(), { wrapper: wrapper({ analytics: fake }) });

    expect(() => result.current.logEvent('teaser_shown')).not.toThrow();
    expect(fake.calls).toHaveLength(1);
  });

  it('swallows a rejected promise without an unhandled rejection', async () => {
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);

    const fake = fakeAnalytics({ rejectOn: ['logEvent'] });
    const { result } = renderHook(() => usePackageAnalytics(), { wrapper: wrapper({ analytics: fake }) });

    result.current.logEvent('teaser_shown');
    await new Promise<void>((resolve) => setImmediate(() => resolve()));

    expect(unhandled).not.toHaveBeenCalled();
    process.off('unhandledRejection', unhandled);
  });

  it('reports both throws and rejections to onAnalyticsError', async () => {
    const onAnalyticsError = jest.fn();
    const fake = fakeAnalytics({ throwOn: ['setUserId'], rejectOn: ['logEvent'] });
    const { result } = renderHook(() => usePackageAnalytics(), {
      wrapper: wrapper({ analytics: fake, onAnalyticsError }),
    });

    result.current.setUserId('u1');
    expect(onAnalyticsError).toHaveBeenCalledWith(expect.any(Error), 'setUserId');

    result.current.logEvent('teaser_shown');
    await new Promise<void>((resolve) => setImmediate(() => resolve()));
    expect(onAnalyticsError).toHaveBeenCalledWith(expect.any(Error), 'logEvent');
  });

  it('survives an onAnalyticsError that itself throws', () => {
    const fake = fakeAnalytics({ throwOn: ['logEvent'] });
    const { result } = renderHook(() => usePackageAnalytics(), {
      wrapper: wrapper({
        analytics: fake,
        onAnalyticsError: () => {
          throw new Error('handler exploded');
        },
      }),
    });

    expect(() => result.current.logEvent('teaser_shown')).not.toThrow();
  });

  it('never re-renders the consumer', () => {
    const fake = fakeAnalytics();
    let renders = 0;
    const { result } = renderHook(
      () => {
        renders++;
        return usePackageAnalytics();
      },
      { wrapper: wrapper({ analytics: fake }) }
    );

    const before = renders;
    result.current.logEvent('teaser_shown');
    result.current.screenView('followup_teaser');

    expect(renders).toBe(before);
  });
});

describe('multiAnalytics', () => {
  it('forwards each call to every implementation exactly once', () => {
    const a = fakeAnalytics();
    const b = fakeAnalytics();
    const { result } = renderHook(() => usePackageAnalytics(), {
      wrapper: wrapper({ analytics: multiAnalytics([a, b]) }),
    });

    result.current.logEvent('teaser_shown', { locale: 'en' });
    result.current.screenView('followup_teaser');

    expect(a.eventNames()).toEqual(['followup_teaser_shown']);
    expect(b.eventNames()).toEqual(['followup_teaser_shown']);
    expect(a.calls).toHaveLength(2);
    expect(b.calls).toHaveLength(2);
  });

  it('keeps delivering to later members when an earlier one throws', () => {
    const bad = fakeAnalytics({ throwOn: ['logEvent'] });
    const good = fakeAnalytics();
    const multi = multiAnalytics([bad, good]);

    expect(() => multi.logEvent('teaser_shown')).not.toThrow();
    expect(good.eventNames()).toEqual(['teaser_shown']);
  });

  it('is a no-op for an empty list', () => {
    expect(() => multiAnalytics([]).logEvent('teaser_shown')).not.toThrow();
  });
});

describe('noopAnalytics', () => {
  it('accepts every call and returns nothing', () => {
    expect(noopAnalytics.logEvent('a')).toBeUndefined();
    expect(noopAnalytics.setUserId(null)).toBeUndefined();
    expect(noopAnalytics.setProperty('k', 'v')).toBeUndefined();
    expect(noopAnalytics.screenView('s')).toBeUndefined();
  });
});
