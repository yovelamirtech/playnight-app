/**
 * §8 שלב 4 — צורת השורות ב-Supabase (snake_case, כמו שחוזר בפועל מ-
 * PostgREST). timestamptz חוזר כ-ISO string; jsonb חוזר כבר פרוס.
 *
 * scope מכוון: זה **גיבוי/שחזור אישי בין מכשירים של אותו משתמש**, לא
 * הקטלוג המשותף-רב-משתמשים שה-SPEC (§6) מתאר לטווח ארוך (איפה
 * typical_session_minutes מצטבר מכל המשתמשים) — זה לא נבנה כאן, ראה
 * HANDOFF.md. `games` כאן הוא רק עותק read-through כדי שהעותקים
 * שהמשתמש עצמו הוסיף יופיעו במכשיר השני.
 */

export type RemoteProfileRow = {
  id: string;
  email: string | null;
  is_pro: boolean;
  default_session_minutes: number;
  primary_platforms: string[];
  opted_out_of_calibration: boolean;
  updated_at: string;
};

export type RemoteGameRow = {
  id: string;
  igdb_id: number | null;
  name: string;
  cover_url: string | null;
  release_year: number | null;
  genres: string[];
  platforms: string[];
  community_rating: number | null;
  typical_session_minutes: number;
  interruptible: boolean;
  session_reports_count: number;
  interruptible_reports_count: number;
  is_calibrated: boolean;
  hltb_main_story_minutes: number | null;
  hltb_main_extra_minutes: number | null;
  hltb_completionist_minutes: number | null;
  hltb_looked_up_at: string | null;
  created_at: string;
};

export type RemoteUserGameRow = {
  id: string;
  user_id: string;
  game_id: string;
  status: string;
  platform: string | null;
  added_at: string;
  last_played_at: string | null;
  hours_played: number;
  progress_percent: number | null;
  is_hidden: boolean;
  dismissed_until: string | null;
  updated_at: string;
};

export type RemoteSessionRow = {
  id: string;
  user_id: string;
  game_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  mood_before: string | null;
  rating: string | null;
  stopped_note: string | null;
  could_stop_anytime: boolean | null;
  screenshot_url: string | null;
};

export type RemoteCalibrationAnswerRow = {
  id: string;
  user_id: string;
  game_id: string;
  session_id: string | null;
  question_id: number;
  answer_value: string;
  answered_at: string;
};
