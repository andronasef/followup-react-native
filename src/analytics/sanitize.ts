/** Event name / parameter sanitization, at the strictest common denominator of
 * GA4 and Microsoft Clarity. Applied before every `logEvent` reaches the
 * host's implementation, so a host can wire up a raw SDK adapter without
 * having to defend against our naming.
 *
 * Pure functions, no React, no third-party imports. */

export const MAX_NAME_LENGTH = 40;
export const MAX_VALUE_LENGTH = 100;
export const MAX_PARAMS = 25;

/** GA4 rejects events using its own reserved namespaces. */
const RESERVED_PREFIXES = ['firebase_', 'google_', 'ga_'];

const VALID = /^[a-z][a-z0-9_]*$/;

/** Coerce an arbitrary string toward `/^[a-z][a-z0-9_]*$/`: lowercase, fold
 * anything outside the charset to `_`, collapse runs, trim edge underscores.
 * Returns null when nothing salvageable remains (e.g. "123", "!!!"). */
function coerce(raw: string, maxLength: number): string | null {
  const folded = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  // Truncating can re-expose a trailing underscore, so trim again after.
  const clipped = folded.slice(0, maxLength).replace(/_+$/g, '');
  return VALID.test(clipped) ? clipped : null;
}

/** Sanitize a fully-prefixed event name. Returns null if the event must be
 * dropped rather than sent — the caller silently skips it.
 *
 * The 40-char limit applies to the prefixed name, since that is what actually
 * ships to GA4. */
export function sanitizeEventName(name: string): string | null {
  const clean = coerce(name, MAX_NAME_LENGTH);
  if (clean === null) return null;
  if (RESERVED_PREFIXES.some((p) => clean.startsWith(p))) return null;
  return clean;
}

function sanitizeValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && Number.isNaN(value)) return null;

  const text = String(value).trim();
  if (text === '') return null;
  return text.slice(0, MAX_VALUE_LENGTH);
}

/** Sanitize an event's parameters: coerce keys to the safe charset, stringify
 * and clamp values, drop empties, and cap the count at GA4's per-event limit.
 *
 * Overflow is deterministic: keys are sorted and the first `MAX_PARAMS` kept,
 * so the same logical event always drops the same parameters regardless of the
 * order the object happened to be built in. */
export function sanitizeParams(params?: Record<string, unknown>): Record<string, string> {
  if (!params) return {};

  const cleaned: Record<string, string> = {};
  for (const rawKey of Object.keys(params)) {
    const value = sanitizeValue(params[rawKey]);
    if (value === null) continue;

    const key = coerce(rawKey, MAX_NAME_LENGTH);
    if (key === null) continue;

    // Two raw keys can fold to the same clean key ("scene index"/"scene_index").
    // First sorted-order winner keeps the slot; ties are resolved consistently.
    if (cleaned[key] === undefined) cleaned[key] = value;
  }

  const keys = Object.keys(cleaned).sort();
  if (keys.length <= MAX_PARAMS) return cleaned;

  const capped: Record<string, string> = {};
  for (const key of keys.slice(0, MAX_PARAMS)) capped[key] = cleaned[key];
  return capped;
}

/** Build the shipped event name from a prefix and a base name. */
export function prefixEventName(prefix: string, name: string): string | null {
  const cleanPrefix = coerce(prefix, MAX_NAME_LENGTH);
  if (cleanPrefix === null) return sanitizeEventName(name);
  return sanitizeEventName(`${cleanPrefix}_${name}`);
}

/** Screen names are not prefixed — hosts want their own real screen names in
 * navigation reports — but they still get trimmed and clamped. Clarity rejects
 * empty/whitespace-only names outright. */
export function sanitizeScreenName(screenName: string): string | null {
  const text = String(screenName).trim();
  if (text === '') return null;
  return text.slice(0, MAX_VALUE_LENGTH);
}
