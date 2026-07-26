import {
  MAX_NAME_LENGTH,
  MAX_PARAMS,
  MAX_VALUE_LENGTH,
  prefixEventName,
  sanitizeEventName,
  sanitizeParams,
  sanitizeScreenName,
} from '../src/analytics/sanitize';

describe('sanitizeEventName', () => {
  it('passes through an already-valid name', () => {
    expect(sanitizeEventName('teaser_shown')).toBe('teaser_shown');
  });

  it('coerces case, separators and repeated underscores', () => {
    expect(sanitizeEventName('Teaser Shown')).toBe('teaser_shown');
    expect(sanitizeEventName('teaser--shown')).toBe('teaser_shown');
    expect(sanitizeEventName('  teaser.shown  ')).toBe('teaser_shown');
    expect(sanitizeEventName('sceneAdvance')).toBe('sceneadvance');
  });

  it('truncates to 40 characters without leaving a trailing underscore', () => {
    const name = sanitizeEventName('a'.repeat(60));
    expect(name).toHaveLength(MAX_NAME_LENGTH);

    const truncatedAtUnderscore = sanitizeEventName(`${'a'.repeat(39)}_${'b'.repeat(20)}`);
    expect(truncatedAtUnderscore).toBe('a'.repeat(39));
  });

  it('rejects names that cannot start with a letter', () => {
    expect(sanitizeEventName('123')).toBeNull();
    expect(sanitizeEventName('!!!')).toBeNull();
    expect(sanitizeEventName('')).toBeNull();
    expect(sanitizeEventName('_9lives')).toBeNull();
  });

  it.each(['firebase_', 'google_', 'ga_'])('rejects the GA4-reserved prefix %s', (reserved) => {
    expect(sanitizeEventName(`${reserved}session_start`)).toBeNull();
  });

  it('does not reject names that merely contain a reserved word', () => {
    expect(sanitizeEventName('open_firebase_console')).toBe('open_firebase_console');
    expect(sanitizeEventName('gate_evaluated')).toBe('gate_evaluated');
  });
});

describe('prefixEventName', () => {
  it('prefixes and sanitizes together', () => {
    expect(prefixEventName('followup', 'teaser_shown')).toBe('followup_teaser_shown');
    expect(prefixEventName('My Pkg', 'Scene Advance')).toBe('my_pkg_scene_advance');
  });

  it('applies the 40-char limit to the prefixed name', () => {
    expect(prefixEventName('followup', 'x'.repeat(60))).toHaveLength(MAX_NAME_LENGTH);
  });

  it('rejects when the prefix itself is GA4-reserved', () => {
    expect(prefixEventName('firebase', 'teaser_shown')).toBeNull();
  });

  it('falls back to the bare name when the prefix is unusable', () => {
    expect(prefixEventName('!!!', 'teaser_shown')).toBe('teaser_shown');
  });
});

describe('sanitizeParams', () => {
  it('returns an empty object for no params', () => {
    expect(sanitizeParams()).toEqual({});
    expect(sanitizeParams({})).toEqual({});
  });

  it('coerces values to trimmed strings', () => {
    expect(sanitizeParams({ scene_index: 3, interested: true, locale: '  ar  ' })).toEqual({
      scene_index: '3',
      interested: 'true',
      locale: 'ar',
    });
  });

  it('drops undefined, null and NaN', () => {
    expect(sanitizeParams({ a: undefined, b: null, c: NaN, d: 0 })).toEqual({ d: '0' });
  });

  it('drops values that are empty after trimming', () => {
    expect(sanitizeParams({ a: '', b: '   ', c: 'ok' })).toEqual({ c: 'ok' });
  });

  it('truncates values to 100 characters', () => {
    expect(sanitizeParams({ url: 'u'.repeat(250) }).url).toHaveLength(MAX_VALUE_LENGTH);
  });

  it('coerces keys and drops unsalvageable ones', () => {
    expect(sanitizeParams({ 'Scene Index': 1, '123': 2, '!!!': 3 })).toEqual({ scene_index: '1' });
  });

  it('truncates keys to 40 characters', () => {
    const key = Object.keys(sanitizeParams({ ['k'.repeat(60)]: 'v' }))[0];
    expect(key).toHaveLength(MAX_NAME_LENGTH);
  });

  it('caps at 25 params, deterministically by sorted key', () => {
    const params: Record<string, unknown> = {};
    // Inserted in reverse so a naive insertion-order cap would give a
    // different answer than the sorted one.
    for (let i = 39; i >= 0; i--) params[`p${String(i).padStart(2, '0')}`] = i;

    const result = sanitizeParams(params);
    expect(Object.keys(result)).toHaveLength(MAX_PARAMS);
    expect(Object.keys(result).sort()).toEqual(
      Array.from({ length: MAX_PARAMS }, (_, i) => `p${String(i).padStart(2, '0')}`)
    );

    // Same logical params, opposite insertion order -> identical result.
    const forward: Record<string, unknown> = {};
    for (let i = 0; i < 40; i++) forward[`p${String(i).padStart(2, '0')}`] = i;
    expect(sanitizeParams(forward)).toEqual(result);
  });

  it('counts params after dropping, so drops can make room', () => {
    const params: Record<string, unknown> = { keep_me: 'yes' };
    for (let i = 0; i < 30; i++) params[`drop${i}`] = null;
    expect(sanitizeParams(params)).toEqual({ keep_me: 'yes' });
  });
});

describe('sanitizeScreenName', () => {
  it('trims and clamps but does not prefix or lowercase', () => {
    expect(sanitizeScreenName('  Followup Teaser  ')).toBe('Followup Teaser');
    expect(sanitizeScreenName('s'.repeat(250))).toHaveLength(MAX_VALUE_LENGTH);
  });

  it('rejects empty and whitespace-only names, which Clarity refuses', () => {
    expect(sanitizeScreenName('')).toBeNull();
    expect(sanitizeScreenName('   ')).toBeNull();
  });
});
