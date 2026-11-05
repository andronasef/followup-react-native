import {
  availableChannels,
  contactUri,
  parseContactConfig,
  type ContactConfig,
} from '../src/contactConfig';

// Pure parsing/link-building only — `loadContactConfig` is covered by the
// Dart port's tests; the AsyncStorage half can't run in this test env.
describe('parseContactConfig', () => {
  test('keeps only non-blank string handles', () => {
    const config = parseContactConfig({
      whatsapp: '201234567890',
      telegram: '   ',
      messenger: 42,
      email: '  hi@example.com  ',
      somethingElse: 'ignored',
    });
    expect(config).toEqual({ whatsapp: '201234567890', email: 'hi@example.com' });
  });

  test('survives junk instead of an object', () => {
    expect(parseContactConfig(null)).toEqual({});
    expect(parseContactConfig('nope')).toEqual({});
    expect(parseContactConfig([])).toEqual({});
  });
});

describe('availableChannels', () => {
  test('reports channels in display order, not key order', () => {
    const config: ContactConfig = { email: 'a@b.c', telegram: 'x', whatsapp: 'y' };
    expect(availableChannels(config)).toEqual(['whatsapp', 'telegram', 'email']);
  });

  test('is empty when nothing is configured', () => {
    expect(availableChannels({})).toEqual([]);
  });
});

describe('contactUri', () => {
  const config: ContactConfig = {
    whatsapp: '201234567890',
    telegram: 'someone',
    messenger: 'somepage',
    email: 'hi@example.com',
  };

  test('builds the right deep link per channel', () => {
    expect(contactUri(config, 'whatsapp')).toBe('https://wa.me/201234567890');
    expect(contactUri(config, 'telegram')).toBe('https://t.me/someone');
    expect(contactUri(config, 'messenger')).toBe('https://m.me/somepage');
    expect(contactUri(config, 'email')).toBe('mailto:hi@example.com');
  });

  test('appends prefilledMessage query param to deep links', () => {
    const msg = 'عاوز اعرف عن اللي انت بتتكلم عنه اكتر!';
    const encoded = encodeURIComponent(msg);

    expect(contactUri(config, 'whatsapp', msg)).toBe(`https://wa.me/201234567890?text=${encoded}`);
    expect(contactUri(config, 'telegram', msg)).toBe(`https://t.me/someone?text=${encoded}`);
    expect(contactUri(config, 'messenger', msg)).toBe(`https://m.me/somepage?text=${encoded}`);
    expect(contactUri(config, 'email', msg)).toBe(`mailto:hi@example.com?body=${encoded}`);
  });

  test('returns undefined for an unconfigured channel', () => {
    expect(contactUri({}, 'whatsapp')).toBeUndefined();
  });
});
