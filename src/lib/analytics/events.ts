import type { PaywallReason } from '@/app/paywall';
import type { SwipeDirection } from '@/components/swipe/SwipeDeck';
import type { CalibrationQuestionId } from '@/lib/calibration/pickQuestion';
import type { SessionRating } from '@/db/schema';

/**
 * אירועי האנליטיקס היחידים שהאפליקציה שולחת (§8 שלב 4: "להבין מה אנשים
 * באמת עושים") — ממופים ללולאה המרכזית של המוצר (§3), לא מעקב מסך-אחרי-מסך.
 * מקור אמת יחיד לשמות/שדות, כדי שלא יהיו שגיאות הקלדה בין קריאה לקריאה.
 */
export type AnalyticsEventProperties = {
  game_added: { method: 'manual' | 'igdb' | 'steam' };
  swipe_decision: { direction: SwipeDirection };
  session_started: { plannedMinutes: number };
  session_logged: { rating: SessionRating; finished: boolean };
  calibration_question_answered: { questionId: CalibrationQuestionId };
  paywall_shown: { reason: PaywallReason | null };
  paywall_purchase_completed: { period: string };
  paywall_restore_completed: Record<string, never>;
  sync_completed: Record<string, never>;
};

export type AnalyticsEventName = keyof AnalyticsEventProperties;
