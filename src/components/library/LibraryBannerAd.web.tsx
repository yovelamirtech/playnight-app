/**
 * `react-native-google-mobile-ads` הוא native-only. Metro בוחר את הקובץ
 * הזה אוטומטית ב-web (convention של `.web.tsx`, אותו דפוס בדיוק כמו
 * `src/lib/revenuecat/nativeGateway.web.ts`) — כך שה-SDK האמיתי אף פעם
 * לא נכנס ל-bundle של web (`vercel-build` תלוי בזה, ראה AGENTS.md §6.4).
 */
export function LibraryBannerAd() {
  return null;
}
