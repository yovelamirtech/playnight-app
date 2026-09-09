import type { MoodId } from '@/constants/session';
import type { SessionRating } from '@/db/schema';

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
  },

  swipe: {
    title: 'What are we playing?',
    empty: "Nothing fits this window right now — try more time or a different mood.",
    gestureHint: '← Not tonight   ·   Tap for details   ·   This! →',
    hideHint: '↑ Not into this one',
    sessionInterruptible: (minutes: number) => `~${minutes} min, stop anytime`,
    sessionLocked: (minutes: number) => `~${minutes} min, best to finish once you start`,
    untouchedLine: (timeAgo: string) => `Added ${timeAgo} ago, haven't touched it`,
    stoppedLine: (timeAgo: string) => `Stopped ${timeAgo} ago`,
    rating: (value: number) => `★ ${Math.round(value)}`,
    exhaustedTitle: "That's everyone who fits",
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
    filters: {
      allPlatforms: 'All platforms',
      allGenres: 'All genres',
      allYears: 'All years',
    },
    sort: {
      label: 'Sort',
      recent: 'Recently added',
      rating: 'Community rating',
      alphabetical: 'A–Z',
      dust: 'Dustiest first',
    },
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
    hoursPlayed: (hours: number) => `${hours.toFixed(1)} hours played`,
    notesTitle: 'Where I stopped',
    noNotes: 'No notes yet.',
    sessionsTitle: 'Sessions',
    noSessions: "You haven't played this yet.",
    playNow: "I'm playing this",
    sessionEntry: (timeAgo: string, minutes: number | null) =>
      minutes ? `${timeAgo} ago · ${minutes} min` : `${timeAgo} ago`,
  },

  sessionConfirm: {
    title: "Let's go",
    enjoy: (name: string) => `Enjoy playing ${name}!`,
    startSession: (minutes: number) => `Start a ${minutes} min session`,
    durationLabel: 'How long do you want to play?',
    minutesLabel: (minutes: number) => `${minutes} min`,
    running: (remaining: number) =>
      remaining > 0 ? `${remaining} min left` : "Time's up — stop whenever you're ready",
    noteLabel: 'Where did I stop?',
    notePlaceholder: 'A note for future you…',
    donePlaying: 'Done playing',
    notificationTitle: 'Time to wrap up?',
    notificationBody: (name: string) => `Your session with ${name} has run its course.`,
  },

  sessionLog: {
    title: 'How was it?',
    ratingQuestion: 'How was it?',
    ratings: {
      loved: 'Loved it',
      liked: 'Liked it',
      meh: 'It was okay',
      bored: 'Bored',
    } satisfies Record<SessionRating, string>,
    calibrationQuestions: {
      1: {
        question: 'Could you stop anytime, or were you locked in until a specific point?',
        options: {
          yes: 'Yes, anytime',
          no: 'No, I was locked in',
          depends: 'Depends',
        },
      },
      2: {
        question: 'Roughly how long is a typical "chapter" in this game (not this session — in general)?',
        options: {
          short: 'Up to 15 min',
          medium: '15–30 min',
          long: '30–60 min',
          veryLong: 'An hour+',
        },
      },
      3: {
        question: 'How often does this game save your progress?',
        options: {
          frequent: 'Every few minutes',
          betweenChapters: 'Only between chapters',
          rare: 'Very rarely',
        },
      },
      4: {
        question: 'Was this more of a "quick jump-in" or a "long sit-down"?',
        options: {
          quickJump: 'Quick jump-in',
          longSit: 'Long sit-down',
          both: 'Both work',
        },
      },
      5: {
        question: 'Did our tag for this game feel accurate?',
        accurateOption: 'Yes, accurate',
        inaccurateOption: "No, it's more...",
      },
    },
    calibrationThanks: (gameName: string) =>
      `Thanks — this helps other players get a better recommendation for ${gameName}.`,
    noteLabel: 'Where did you stop?',
    notePlaceholder: "Write something that'll help you in a month",
    finishedQuestion: 'Did you finish the game?',
    yes: 'Yes',
    no: 'No',
    submit: 'Save',
    skip: 'Skip',
  },

  connectSteam: {
    title: 'Connect Steam',
    inputLabel: 'Steam ID or profile name',
    inputHint: 'Find your 17-digit Steam ID at steamid.io, or use your custom profile URL name.',
    importCta: 'Import my library',
    importing: (done: number, total: number) => `Importing ${done}/${total} games…`,
    resolving: 'Looking up your profile…',
    emptyLibrary: "That profile doesn't have any games, or its game details are private.",
    doneTitle: 'Library imported',
    doneBody: (imported: number, updated: number) =>
      updated > 0
        ? `Added ${imported} new games, updated ${updated} already in your library.`
        : `Added ${imported} games to your library.`,
    backToLibrary: 'Go to library',
  },

  settings: {
    title: 'Settings',
    connectSteam: 'Connect / re-sync Steam',
    calibrationOptOut: 'Stop asking me calibration questions',
    calibrationOptOutHint:
      "You'll still benefit from what other players contribute (§4.5).",
    placeholder: 'More settings arrive in a later phase.',
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
