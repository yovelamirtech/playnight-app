import { describe, expect, it } from 'vitest';

import { formatTimeAgo } from './timeAgo';

const NOW = new Date('2026-09-08T12:00:00Z');

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

describe('formatTimeAgo', () => {
  it('returns "today" for less than a day', () => {
    expect(formatTimeAgo(daysAgo(0), NOW)).toBe('today');
  });

  it('singularizes 1 day', () => {
    expect(formatTimeAgo(daysAgo(1), NOW)).toBe('1 day');
  });

  it('uses days under a month', () => {
    expect(formatTimeAgo(daysAgo(20), NOW)).toBe('20 days');
  });

  it('switches to months', () => {
    expect(formatTimeAgo(daysAgo(120), NOW)).toBe('4 months');
  });

  it('singularizes 1 month', () => {
    expect(formatTimeAgo(daysAgo(30), NOW)).toBe('1 month');
  });

  it('switches to years', () => {
    expect(formatTimeAgo(daysAgo(800), NOW)).toBe('2 years');
  });

  it('singularizes 1 year', () => {
    expect(formatTimeAgo(daysAgo(365), NOW)).toBe('1 year');
  });
});
