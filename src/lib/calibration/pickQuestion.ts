/**
 * מנוע הכיול (§4.5) — שער כללי (האם לשאול) + בחירת שאלה מהבנק (§4.5, "בנק השאלות").
 */
export type CalibrationInputs = {
  gameSessionReportsCount: number;
  calibrationQuestionsAnsweredTodayByUser: number;
  userOptedOutOfCalibration: boolean;
};

const CALIBRATED_THRESHOLD = 15;
const DAILY_FATIGUE_LIMIT = 3;

/** true = יש להציג שאלת כיול (איזו — ראה pickCalibrationQuestionId) במסך הלוג המהיר (§3.5). */
export function shouldAskCalibrationQuestion(inputs: CalibrationInputs): boolean {
  if (inputs.userOptedOutOfCalibration) return false;
  if (inputs.calibrationQuestionsAnsweredTodayByUser >= DAILY_FATIGUE_LIMIT) return false;
  if (inputs.gameSessionReportsCount >= CALIBRATED_THRESHOLD) return false;
  return true;
}

export type CalibrationQuestionId = 1 | 2 | 3 | 4 | 5;

const ROTATING_QUESTION_IDS = [2, 3, 4, 5] as const;
const QUESTION_1_PRIORITY_THRESHOLD = 8;

export type PickCalibrationQuestionInputs = {
  /** כמה תשובות יש כבר לשאלה #1 עבור המשחק הזה (§4.5, "לוגיקת בחירת שאלה"). */
  interruptibleReportsCount: number;
  /** כמה תשובות יש כבר לכל אחת משאלות 2–5 עבור המשחק הזה. */
  questionAnsweredCounts: Partial<Record<2 | 3 | 4 | 5, number>>;
  /** נקודת הזרקה לבדיקה דטרמיניסטית — ברירת המחדל היא Math.random. */
  random?: () => number;
};

/**
 * בוחר איזו שאלה מהבנק להציג, בהתאם לפסאודו-קוד ב-§4.5:
 * שאלה #1 קודמת לכולן עד שיש לה 8 תשובות, ואז רוטציה משוקללת בין 2–5 —
 * ככל שלשאלה יש פחות תשובות (פער גדול יותר בנתונים), כך היא מקבלת משקל גבוה יותר.
 */
export function pickCalibrationQuestionId(
  inputs: PickCalibrationQuestionInputs
): CalibrationQuestionId {
  if (inputs.interruptibleReportsCount < QUESTION_1_PRIORITY_THRESHOLD) return 1;

  const weights = ROTATING_QUESTION_IDS.map(
    (id) => 1 / ((inputs.questionAnsweredCounts[id] ?? 0) + 1)
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const roll = (inputs.random ?? Math.random)() * totalWeight;

  let accumulated = 0;
  for (let i = 0; i < ROTATING_QUESTION_IDS.length; i++) {
    accumulated += weights[i];
    if (roll < accumulated) return ROTATING_QUESTION_IDS[i];
  }
  return ROTATING_QUESTION_IDS[ROTATING_QUESTION_IDS.length - 1];
}
