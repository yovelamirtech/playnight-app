/**
 * ערכי צבע גולמיים לשימושים שלא עוברים דרך className
 * (StatusBar, screenOptions של expo-router, וכו').
 * מקור האמת לצבעים הוא tailwind.config.js — שמור על סנכרון.
 */
export const palette = {
  bg: '#0B0D12',
  surface: '#151922',
  surfaceAlt: '#1E2430',
  border: '#2A3140',
  text: '#F2F4F8',
  muted: '#8B93A3',
  accent: '#6C5CE7',
  accentSoft: '#8F82F0',
  good: '#2ECC71',
  warn: '#F1C40F',
} as const;

export type PaletteColor = keyof typeof palette;
