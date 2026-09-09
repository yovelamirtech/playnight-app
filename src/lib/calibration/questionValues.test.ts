import { describe, expect, it } from 'vitest';

import { saveFrequencyLeansInterruptible } from './questionValues';

describe('saveFrequencyLeansInterruptible', () => {
  it('treats frequent saves as interruptible', () => {
    expect(saveFrequencyLeansInterruptible('frequent')).toBe(true);
  });

  it('treats rare saves and chapter-only saves as locked', () => {
    expect(saveFrequencyLeansInterruptible('betweenChapters')).toBe(false);
    expect(saveFrequencyLeansInterruptible('rare')).toBe(false);
  });
});
