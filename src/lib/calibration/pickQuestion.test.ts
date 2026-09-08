import { describe, expect, it } from 'vitest';

import { shouldAskCalibrationQuestion } from './pickQuestion';

const base = {
  gameSessionReportsCount: 0,
  calibrationQuestionsAnsweredTodayByUser: 0,
  userOptedOutOfCalibration: false,
};

describe('shouldAskCalibrationQuestion', () => {
  it('asks by default for an uncalibrated game', () => {
    expect(shouldAskCalibrationQuestion(base)).toBe(true);
  });

  it('stops once the game is calibrated (>= 15 reports)', () => {
    expect(shouldAskCalibrationQuestion({ ...base, gameSessionReportsCount: 15 })).toBe(false);
    expect(shouldAskCalibrationQuestion({ ...base, gameSessionReportsCount: 20 })).toBe(false);
    expect(shouldAskCalibrationQuestion({ ...base, gameSessionReportsCount: 14 })).toBe(true);
  });

  it('stops after 3 calibration questions today (fatigue guard)', () => {
    expect(
      shouldAskCalibrationQuestion({ ...base, calibrationQuestionsAnsweredTodayByUser: 3 })
    ).toBe(false);
    expect(
      shouldAskCalibrationQuestion({ ...base, calibrationQuestionsAnsweredTodayByUser: 2 })
    ).toBe(true);
  });

  it('respects a permanent opt-out (§4.5.4)', () => {
    expect(shouldAskCalibrationQuestion({ ...base, userOptedOutOfCalibration: true })).toBe(false);
  });
});
