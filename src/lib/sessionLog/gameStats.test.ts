import { describe, expect, it } from 'vitest';

import { isCalibrated, nextInterruptible, nextTypicalMinutes } from './gameStats';

describe('nextTypicalMinutes', () => {
  it('takes the real duration as-is for the first report', () => {
    expect(nextTypicalMinutes(40, 0, 18)).toBe(18);
  });

  it('averages in the new duration', () => {
    // (20*1 + 30) / 2 = 25
    expect(nextTypicalMinutes(20, 1, 30)).toBe(25);
  });
});

describe('nextInterruptible', () => {
  it('keeps the current value with no answers yet', () => {
    expect(nextInterruptible(0, 0, false)).toBe(false);
  });

  it('flips to interruptible once yes is the majority', () => {
    expect(nextInterruptible(5, 8, false)).toBe(true);
    expect(nextInterruptible(3, 8, true)).toBe(false);
  });
});

describe('isCalibrated', () => {
  it('is true only from 15 reports onward', () => {
    expect(isCalibrated(14)).toBe(false);
    expect(isCalibrated(15)).toBe(true);
  });
});
