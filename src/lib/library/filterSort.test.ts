import { describe, expect, it } from 'vitest';

import { filterLibrary, sortLibrary } from './filterSort';

const rows = [
  {
    name: 'Hades',
    platform: 'PC',
    genres: ['Roguelike', 'Action'],
    releaseYear: 2020,
    communityRating: 90,
    addedAt: new Date('2024-01-01'),
    lastPlayedAt: new Date('2024-06-01'),
  },
  {
    name: 'Braid',
    platform: 'Switch',
    genres: ['Puzzle'],
    releaseYear: 2008,
    communityRating: 80,
    addedAt: new Date('2024-03-01'),
    lastPlayedAt: null,
  },
  {
    name: 'Celeste',
    platform: 'PC',
    genres: ['Platform'],
    releaseYear: 2018,
    communityRating: null,
    addedAt: new Date('2024-02-01'),
    lastPlayedAt: new Date('2024-02-15'),
  },
];

describe('filterLibrary', () => {
  it('returns everything with no filters set', () => {
    expect(filterLibrary(rows, { platform: null, genre: null, year: null })).toHaveLength(3);
  });

  it('filters by platform', () => {
    const result = filterLibrary(rows, { platform: 'PC', genre: null, year: null });
    expect(result.map((r) => r.name)).toEqual(['Hades', 'Celeste']);
  });

  it('filters by genre membership', () => {
    const result = filterLibrary(rows, { platform: null, genre: 'Puzzle', year: null });
    expect(result.map((r) => r.name)).toEqual(['Braid']);
  });

  it('filters by release year', () => {
    const result = filterLibrary(rows, { platform: null, genre: null, year: 2020 });
    expect(result.map((r) => r.name)).toEqual(['Hades']);
  });

  it('combines filters', () => {
    const result = filterLibrary(rows, { platform: 'PC', genre: 'Action', year: null });
    expect(result.map((r) => r.name)).toEqual(['Hades']);
  });
});

describe('sortLibrary', () => {
  it('sorts by recently added, newest first', () => {
    expect(sortLibrary(rows, 'recent').map((r) => r.name)).toEqual(['Braid', 'Celeste', 'Hades']);
  });

  it('sorts by community rating, unrated last', () => {
    expect(sortLibrary(rows, 'rating').map((r) => r.name)).toEqual(['Hades', 'Braid', 'Celeste']);
  });

  it('sorts alphabetically', () => {
    expect(sortLibrary(rows, 'alphabetical').map((r) => r.name)).toEqual([
      'Braid',
      'Celeste',
      'Hades',
    ]);
  });

  it('sorts dustiest first (never-played falls back to addedAt)', () => {
    // Braid: never played -> addedAt 2024-03-01. Celeste: lastPlayed 2024-02-15.
    // Hades: lastPlayed 2024-06-01. Oldest touch first: Celeste, Braid, Hades.
    expect(sortLibrary(rows, 'dust').map((r) => r.name)).toEqual(['Celeste', 'Braid', 'Hades']);
  });
});
