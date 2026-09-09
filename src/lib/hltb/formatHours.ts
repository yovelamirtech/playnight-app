/** דקות → תווית שעות לתצוגה (§3.7: "Main Story / Main+Extras / Completionist"). */
export function formatHltbHours(minutes: number | null): string | null {
  if (minutes == null) return null;
  const hours = minutes / 60;
  const rounded = Math.round(hours * 2) / 2; // חצי-שעה קרובה
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`;
}
