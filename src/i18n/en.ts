import type { MoodId } from '@/constants/session';

/**
 * מקור האמת לכל טקסט ב-UI.
 * שפה נוספת = קובץ נוסף שמקיים את הטיפוס Dictionary (src/i18n/types.ts),
 * ו-TypeScript יכשל אם חסר בו מפתח.
 */
export const en = {
  appName: 'PlayNight',

  home: {
    timeQuestion: 'How much time do you have?',
    timeOptions: {
      30: '30 min',
      60: '1 hour',
      120: '2 hours',
      240: 'All evening',
    },
    moodQuestion: 'What are you in the mood for?',
    moods: {
      deep: 'Something deep',
      action: 'Quick action',
      chill: 'Chill',
      finish: 'Finish something',
      fresh: 'Something new',
      surprise: 'Surprise me',
    } satisfies Record<MoodId, string>,
    cta: 'Pick a game for me',
    emptyTitle: 'Your library is empty',
    emptyBody: "Add a game and we'll take it from there.",
    emptyConnect: 'Connect Steam',
    emptyAdd: 'Add a game',
    steamComingSoon: 'Steam import arrives in phase 2.',
  },

  swipe: {
    title: 'What are we playing?',
    placeholder: 'The recommendation engine arrives in phase 2.',
    moodLine: (mood: string) => `Mood: ${mood}`,
    noMood: 'any',
    exhausted: '5 more options',
    changeFilters: 'Change filters',
  },

  library: {
    title: 'Library',
    tabs: {
      playing: 'Playing',
      backlog: 'Backlog',
      beaten: 'Beaten',
      shelved: 'Shelved',
      abandoned: 'Abandoned',
    },
    empty: 'Nothing here yet.',
    add: 'Add game',
  },

  addGame: {
    title: 'Add a game',
    searchTab: 'Search',
    manualTab: 'Manual',
    searchLabel: 'Game name',
    searchHint: 'Search is offline — showing sample results only.',
    searchFailed: 'Search is unavailable. Is the IGDB proxy running?',
    searchFallback: "Can't reach the IGDB proxy — showing sample results.",
    nameLabel: 'Game name',
    platformLabel: 'Platform',
    yearLabel: 'Release year',
    save: 'Add to library',
    nameRequired: 'A game name is required',
  },

  game: {
    notFound: 'Game not found',
    notesTitle: 'Where I stopped',
    noNotes: 'No notes yet.',
    sessionsTitle: 'Sessions',
    noSessions: "You haven't played this yet.",
  },

  settings: {
    title: 'Settings',
    placeholder: 'Settings arrive in a later phase.',
  },

  nav: {
    home: 'What to play?',
    library: 'Library',
    settings: 'Settings',
    back: 'Back',
  },

  errors: {
    databaseFailed: (message: string) => `Could not open the database:\n${message}`,
  },
} as const;
