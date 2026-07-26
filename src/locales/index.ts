import type { FollowUpStrings } from '../types';
import { ar } from './ar';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';
import { hi } from './hi';
import { zh } from './zh';
import { ru } from './ru';
import { id } from './id';
import { sw } from './sw';

/** The 10 languages shipped in v1. Copy is original per language (not a
 * literal translation of any single source) but follows the same five-beat
 * arc: the world is broken → God loves us anyway → Christ is the answer →
 * an invitation to respond. Ported verbatim from the Flutter package. */
export const all: Record<string, FollowUpStrings> = { ar, en, es, fr, pt, hi, zh, ru, id, sw };

export const rtlLanguageCodes = new Set(['ar']);

export function isRtl(languageCode: string): boolean {
  return rtlLanguageCodes.has(languageCode);
}

/** Resolves a device language code to the closest supported language,
 * defaulting to English when there's no match. */
export function resolve(languageCode: string): FollowUpStrings {
  return all[languageCode] ?? en;
}

export function resolveLanguageCode(languageCode: string): string {
  return languageCode in all ? languageCode : 'en';
}

export { ar, en, es, fr, pt, hi, zh, ru, id, sw };
