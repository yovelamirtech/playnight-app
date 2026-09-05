import { getLocales } from 'expo-localization';

import { en } from './en';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './types';
import type { Dictionary, Locale } from './types';

const dictionaries: Record<Locale, Dictionary> = { en };

const isSupported = (code: string): code is Locale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(code);

/** בוחר את שפת המכשיר אם היא נתמכת, אחרת נופל לאנגלית. */
export function resolveLocale(): Locale {
  const deviceCode = getLocales()[0]?.languageCode;
  return deviceCode && isSupported(deviceCode) ? deviceCode : DEFAULT_LOCALE;
}

export const locale: Locale = resolveLocale();

/** נקודת הגישה היחידה לטקסט ב-UI. */
export const t: Dictionary = dictionaries[locale];

export type { Dictionary, Locale };
export { DEFAULT_LOCALE, SUPPORTED_LOCALES, isRtlLocale } from './types';
