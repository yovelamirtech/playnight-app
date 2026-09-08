/**
 * מנוע הכיול (§4.5) — MVP כולל רק שאלה #1 (couldStopAnytime, §4.4).
 * שאלות 2-5 מבנק השאלות נשארות ל"אם יש זמן" (§4.5, "בנק השאלות").
 */
export type CalibrationInputs = {
  gameSessionReportsCount: number;
  calibrationQuestionsAnsweredTodayByUser: number;
  userOptedOutOfCalibration: boolean;
};

const CALIBRATED_THRESHOLD = 15;
const DAILY_FATIGUE_LIMIT = 3;

/** true = הצג את שאלת הכיול #1 במסך הלוג המהיר (§3.5). */
export function shouldAskCalibrationQuestion(inputs: CalibrationInputs): boolean {
  if (inputs.userOptedOutOfCalibration) return false;
  if (inputs.calibrationQuestionsAnsweredTodayByUser >= DAILY_FATIGUE_LIMIT) return false;
  if (inputs.gameSessionReportsCount >= CALIBRATED_THRESHOLD) return false;
  return true;
}
