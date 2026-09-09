import { describe, expect, it } from 'vitest';

import { pickCalibrationQuestionId, shouldAskCalibrationQuestion } from './pickQuestion';

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

describe('pickCalibrationQuestionId', () => {
  it('prioritizes question #1 until it has 8 answers', () => {
    expect(
      pickCalibrationQuestionId({ interruptibleReportsCount: 0, questionAnsweredCounts: {} })
    ).toBe(1);
    expect(
      pickCalibrationQuestionId({ interruptibleReportsCount: 7, questionAnsweredCounts: {} })
    ).toBe(1);
  });

  it('rotates among questions 2-5 once question #1 has 8+ answers', () => {
    const id = pickCalibrationQuestionId({
      interruptibleReportsCount: 8,
      questionAnsweredCounts: {},
      random: () => 0,
    });
    expect([2, 3, 4, 5]).toContain(id);
  });

  it('weights the question with the biggest data gap higher (deterministic random)', () => {
    // 2 has 0 answers (weight 1), 3/4/5 each have 99 (weight ~0.01) — a low roll must land on 2.
    const id = pickCalibrationQuestionId({
      interruptibleReportsCount: 8,
      questionAnsweredCounts: { 2: 0, 3: 99, 4: 99, 5: 99 },
      random: () => 0,
    });
    expect(id).toBe(2);
  });

  it('picks the last candidate when the roll lands at the top of the range', () => {
    const id = pickCalibrationQuestionId({
      interruptibleReportsCount: 8,
      questionAnsweredCounts: {},
      random: () => 0.999999,
    });
    expect(id).toBe(5);
  });
});
