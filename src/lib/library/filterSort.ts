/**
 * §3.6 — פילטרים ומיון בספרייה. פונקציות טהורות; library.tsx מזין
 * להן את השורות שכבר נטענו מה-DB (המסך עצמו תמיד מוגבל לטאב סטטוס אחד).
 */
export type LibraryFilters = {
  platform: string | null;
  genre: string | null;
  year: number | null;
};

export const EMPTY_LIBRARY_FILTERS: LibraryFilters = { platform: null, genre: null, year: null };

export const SORT_OPTIONS = ['recent', 'rating', 'alphabetical', 'dust', 'completionTime'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

type FilterableRow = {
  platform: string | null;
  genres: string[];
  releaseYear: number | null;
};

export function filterLibrary<T extends FilterableRow>(rows: T[], filters: LibraryFilters): T[] {
  return rows.filter(
    (row) =>
      (!filters.platform || row.platform === filters.platform) &&
      (!filters.genre || row.genres.includes(filters.genre)) &&
      (!filters.year || row.releaseYear === filters.year)
  );
}

type SortableRow = {
  name: string;
  communityRating: number | null;
  addedAt: Date;
  lastPlayedAt: Date | null;
  hltbMainStoryMinutes: number | null;
};

/** "אבק" (§3.6) — הכי מזמן לא נגעו קודם. */
function dustTimestamp(row: SortableRow): number {
  return (row.lastPlayedAt ?? row.addedAt).getTime();
}

export function sortLibrary<T extends SortableRow>(rows: T[], sort: SortOption): T[] {
  const sorted = [...rows];
  switch (sort) {
    case 'recent':
      return sorted.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    case 'rating':
      return sorted.sort((a, b) => (b.communityRating ?? -1) - (a.communityRating ?? -1));
    case 'alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'dust':
      return sorted.sort((a, b) => dustTimestamp(a) - dustTimestamp(b));
    case 'completionTime':
      // אין נתון (עוד לא נבדק מול HLTB, או אין התאמה) → בסוף הרשימה.
      return sorted.sort((a, b) => {
        if (a.hltbMainStoryMinutes == null) return b.hltbMainStoryMinutes == null ? 0 : 1;
        if (b.hltbMainStoryMinutes == null) return -1;
        return a.hltbMainStoryMinutes - b.hltbMainStoryMinutes;
      });
    default:
      return sorted;
  }
}
