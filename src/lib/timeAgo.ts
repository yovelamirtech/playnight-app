const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * §3.3 — "קנית לפני 2 שנים, לא נגעת" / "עצרת לפני 4 חודשים" צריכים יחידת
 * זמן אנושית אחת (הכי גסה שמתאימה), לא הפרש מדויק בימים.
 */
export function formatTimeAgo(date: Date, now: Date = new Date()): string {
  const days = Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_MS));

  if (days < 1) return 'today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? '1 month' : `${months} months`;

  const years = Math.floor(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
}
