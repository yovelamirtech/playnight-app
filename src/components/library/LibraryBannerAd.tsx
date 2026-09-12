import { useEffect } from 'react';
import { Platform } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { ADMOB_ANDROID_BANNER_UNIT_ID, ADMOB_IOS_BANNER_UNIT_ID } from '@/lib/ads/config';
import { useIsPro } from '@/lib/revenuecat/useIsPro';

import { AdErrorBoundary } from './AdErrorBoundary';

const bannerUnitId =
  (Platform.OS === 'android' ? ADMOB_ANDROID_BANNER_UNIT_ID : ADMOB_IOS_BANNER_UNIT_ID) ??
  TestIds.BANNER;

/**
 * §5 — פרסומת באנר בתחתית הספרייה בלבד למשתמשי Free, **לא** במסך
 * ההחלטה/סוואיפ (§3.2/§3.3 — "קדוש", אין ספינר/עיכוב/הפרעה שם).
 * Pro אין לו פרסומות בכלל (§5). `AdErrorBoundary` בולע קריסת render אם
 * ה-native module לא רשום (Expo Go בלי Dev Build, ראה AGENTS.md §2).
 */
export function LibraryBannerAd() {
  const isPro = useIsPro();

  useEffect(() => {
    if (isPro) return;
    mobileAds()
      .initialize()
      .catch(() => undefined);
  }, [isPro]);

  if (isPro) return null;

  return (
    <AdErrorBoundary>
      <BannerAd unitId={bannerUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </AdErrorBoundary>
  );
}
