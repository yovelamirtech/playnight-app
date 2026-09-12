import { RevenueCatNotConfiguredError } from './types';
import type { RevenueCatGateway } from './types';

/**
 * `react-native-purchases` הוא native-only (אין build web). Metro בוחר
 * את הקובץ הזה אוטומטית כש-`expo export --platform web` מריץ — כך שה-SDK
 * האמיתי אף פעם לא נכנס ל-bundle של ה-web (vercel-build תלוי בזה שזה יעבוד,
 * גם אם web עצמו אינו יעד נתמך — ראה AGENTS.md §6.4).
 */
export const createNativeRevenueCatGateway = (): RevenueCatGateway => {
  throw new RevenueCatNotConfiguredError();
};
