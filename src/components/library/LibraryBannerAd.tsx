import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { ADMOB_ANDROID_BANNER_UNIT_ID, ADMOB_IOS_BANNER_UNIT_ID } from '@/lib/ads/config';
import { useIsPro } from '@/lib/revenuecat/useIsPro';

import { AdErrorBoundary } from './AdErrorBoundary';

type AdsModule = typeof import('react-native-google-mobile-ads');

/**
 * §5 — פרסומת באנר בתחתית הספרייה בלבד למשתמשי Free, **לא** במסך
 * ההחלטה/סוואיפ (§3.2/§3.3 — "קדוש", אין ספינר/עיכוב/הפרעה שם).
 * Pro אין לו פרסומות בכלל (§5).
 *
 * ב-Expo Go (בלי Dev Build, ראה AGENTS.md §2) `react-native-google-mobile-ads`
 * זורק **בזמן import של החבילה עצמה** (לא רק בזמן render) — `AdErrorBoundary`
 * לא עוזר שם, כי היא תופסת רק שגיאות render. לכן ה-`require` נדחה לרנטיים
 * ומתבצע רק כש-`executionEnvironment` הוא לא `StoreClient` (= Expo Go).
 */
export function LibraryBannerAd() {
  const isPro = useIsPro();
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  useEffect(() => {
    if (isPro || isExpoGo) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- deferred require, see doc comment above
    const { default: mobileAds } = require('react-native-google-mobile-ads') as AdsModule;
    mobileAds()
      .initialize()
      .catch(() => undefined);
  }, [isPro, isExpoGo]);

  if (isPro || isExpoGo) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports -- deferred require, see doc comment above
  const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads') as AdsModule;
  const bannerUnitId =
    (Platform.OS === 'android' ? ADMOB_ANDROID_BANNER_UNIT_ID : ADMOB_IOS_BANNER_UNIT_ID) ??
    TestIds.BANNER;

  return (
    <AdErrorBoundary>
      <BannerAd unitId={bannerUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </AdErrorBoundary>
  );
}
