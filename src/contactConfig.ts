import AsyncStorage from '@react-native-async-storage/async-storage';

/** One reachable channel on the contact screen, in display order. */
export const CONTACT_CHANNELS = ['whatsapp', 'telegram', 'messenger', 'email'] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

/** Where a visitor can reach a real person. Fetched from a small hosted JSON
 * file so the handles can change without shipping an app update — the same
 * file backs the web page at https://followup-web-simple.pages.dev. */
export type ContactConfig = Partial<Record<ContactChannel, string>>;

export const DEFAULT_CONTACT_CONFIG_URL = 'https://followup-web-simple.pages.dev/config.json';

/** The page that renders this same config in a browser — the fallback when
 * the JSON can't be fetched *and* nothing was ever cached. */
export const CONTACT_FALLBACK_PAGE_URL = 'https://followup-web-simple.pages.dev/';

const CACHE_KEY = 'follow_up_contact_config';

/** Ignores anything that isn't a non-blank string, so a malformed or
 * half-edited config degrades to fewer buttons rather than broken links. */
export function parseContactConfig(raw: unknown): ContactConfig {
  const out: ContactConfig = {};
  if (typeof raw !== 'object' || raw === null) return out;
  for (const channel of CONTACT_CHANNELS) {
    const value = (raw as Record<string, unknown>)[channel];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) out[channel] = trimmed;
  }
  return out;
}

/** Channels that actually have a handle, in display order. */
export function availableChannels(config: ContactConfig): ContactChannel[] {
  return CONTACT_CHANNELS.filter((c) => config[c]);
}

/** Deep link for `channel`, or undefined when it has no handle configured. */
export function contactUri(
  config: ContactConfig,
  channel: ContactChannel,
  prefilledMessage?: string,
): string | undefined {
  const value = config[channel];
  if (!value) return undefined;
  const encodedText = prefilledMessage ? encodeURIComponent(prefilledMessage) : undefined;
  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/${encodeURIComponent(value)}${encodedText ? `?text=${encodedText}` : ''}`;
    case 'telegram':
      return `https://t.me/${encodeURIComponent(value)}${encodedText ? `?text=${encodedText}` : ''}`;
    case 'messenger':
      return `https://m.me/${encodeURIComponent(value)}${encodedText ? `?text=${encodedText}` : ''}`;
    case 'email':
      return `mailto:${value}${encodedText ? `?body=${encodedText}` : ''}`;
  }
}

/** Fetches the config, falling back to the last successful fetch when the
 * network is unavailable. Resolves to null only when both fail — the caller
 * then sends the visitor to `CONTACT_FALLBACK_PAGE_URL` instead.
 *
 * Never rejects: a contact screen that can't load is a dead end, but a crash
 * mid-flow is worse. */
export async function loadContactConfig({
  url = DEFAULT_CONTACT_CONFIG_URL,
  timeoutMs = 6000,
}: { url?: string; timeoutMs?: number } = {}): Promise<ContactConfig | null> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: abort.signal });
    if (res.ok) {
      const body = await res.text();
      const parsed = parseContactConfig(JSON.parse(body));
      if (availableChannels(parsed).length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, body);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('follow_up: contact config fetch failed', e);
  } finally {
    clearTimeout(timer);
  }

  const cached = await AsyncStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  try {
    const parsed = parseContactConfig(JSON.parse(cached));
    return availableChannels(parsed).length > 0 ? parsed : null;
  } catch {
    await AsyncStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/** QA-only: drops the cached copy so the next load must hit the network. */
export async function debugClearContactCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
