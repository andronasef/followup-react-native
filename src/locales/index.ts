import type { FollowUpStrings } from '../types';
import { ar, arVariants } from './ar';
import { en, enVariants } from './en';
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

/** Multi-track variants available per language. Languages with multiple tracks
 * offer different angles (e.g. Unconditional Love, The Healer, Forgiveness). */
export const allVariants: Record<string, readonly FollowUpStrings[]> = {
  ar: arVariants,
  en: enVariants,
  es: [es],
  fr: [fr],
  pt: [pt],
  hi: [hi],
  zh: [zh],
  ru: [ru],
  id: [id],
  sw: [sw],
};

export const rtlLanguageCodes = new Set(['ar']);

export function isRtl(languageCode: string): boolean {
  return rtlLanguageCodes.has(languageCode);
}

/** Resolves a device language code to the closest supported language,
 * defaulting to English when there's no match.
 *
 * If `variantIndex` is given, it picks that specific track. Otherwise, it
 * picks randomly across the tracks available for that language so different
 * visitors encounter different angles. */
export function resolve(
  languageCode: string,
  variantIndex?: number,
  random: () => number = Math.random,
): FollowUpStrings {
  const code = languageCode in allVariants ? languageCode : 'en';
  const variants = allVariants[code] ?? enVariants;
  if (variantIndex !== undefined) {
    const idx = ((variantIndex % variants.length) + variants.length) % variants.length;
    return variants[idx];
  }
  const idx = Math.floor(random() * variants.length);
  return variants[idx];
}

export function resolveLanguageCode(languageCode: string): string {
  return languageCode in all ? languageCode : 'en';
}

export { ar, arVariants, en, enVariants, es, fr, pt, hi, zh, ru, id, sw };
