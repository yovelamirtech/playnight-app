/**
 * Last-write-wins על סמך updated_at (§8 שלב 4). פונקציה טהורה — נבדקת
 * בלי DB/רשת אמיתיים.
 */
export function shouldApplyRemote(localUpdatedAt: Date | null, remoteUpdatedAt: Date): boolean {
  if (!localUpdatedAt) return true;
  return remoteUpdatedAt.getTime() > localUpdatedAt.getTime();
}

/** אילו שורות מרוחקות עוד לא קיימות מקומית — לטבלאות write-once (sessions, calibration_answers). */
export function findMissingRemoteIds(localIds: readonly string[], remoteIds: readonly string[]): string[] {
  const localSet = new Set(localIds);
  return remoteIds.filter((id) => !localSet.has(id));
}
