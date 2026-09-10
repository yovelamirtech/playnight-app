import { describe, expect, it } from 'vitest';

import { findMissingRemoteIds, shouldApplyRemote } from './resolveConflict';

describe('shouldApplyRemote', () => {
  it('applies remote when there is no local row yet', () => {
    expect(shouldApplyRemote(null, new Date('2026-01-01'))).toBe(true);
  });

  it('applies remote only when it is strictly newer', () => {
    const local = new Date('2026-01-05T12:00:00Z');
    expect(shouldApplyRemote(local, new Date('2026-01-05T11:59:59Z'))).toBe(false);
    expect(shouldApplyRemote(local, local)).toBe(false);
    expect(shouldApplyRemote(local, new Date('2026-01-05T12:00:01Z'))).toBe(true);
  });
});

describe('findMissingRemoteIds', () => {
  it('returns remote ids that are not present locally', () => {
    expect(findMissingRemoteIds(['a', 'b'], ['b', 'c', 'd'])).toEqual(['c', 'd']);
  });

  it('returns nothing when everything is already local', () => {
    expect(findMissingRemoteIds(['a', 'b'], ['a'])).toEqual([]);
  });

  it('returns everything when nothing is local yet', () => {
    expect(findMissingRemoteIds([], ['x', 'y'])).toEqual(['x', 'y']);
  });
});
