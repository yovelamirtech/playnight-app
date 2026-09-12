/**
 * factory משותף ל"singleton gateway": בפעם הראשונה בוחר בין המימוש
 * האמיתי למוק לפי isConfigured(), ואז שומר אותו במטמון קבוע לכל קריאה
 * הבאה. igdb/steam/hltb/revenuecat כולם חזרו על אותו תבנית ידנית.
 */
export function createCachedGateway<T>(
  isConfigured: () => boolean,
  createReal: () => T,
  createMock: () => T
): () => T {
  let cached: T | null = null;
  return () => {
    if (!cached) {
      cached = isConfigured() ? createReal() : createMock();
    }
    return cached;
  };
}
