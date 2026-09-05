import type { en } from './en';

/**
 * הטיפוס נגזר מהמילון האנגלי. כל מילון נוסף חייב לקיים אותו,
 * ולכן שכחת מפתח בתרגום היא שגיאת קומפילציה, לא באג בזמן ריצה.
 */
export type Dictionary = typeof en;

export const SUPPORTED_LOCALES = ['en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** שפות שנכתבות מימין לשמאל — כשנוסיף 'he' צריך גם לכפות RTL. */
export const RTL_LOCALES: readonly string[] = ['he', 'ar', 'fa', 'ur'];

export const isRtlLocale = (locale: string): boolean => RTL_LOCALES.includes(locale);
