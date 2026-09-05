import { create } from 'zustand';

import type { MoodId, TimeOptionMinutes } from '@/constants/session';

/**
 * הבחירה של מסך "מה לשחק?" (§3.2) שעוברת למסך ה-Swipe (§3.3).
 * מוחזק בזיכרון בלבד — הבחירה רלוונטית לערב הנוכחי, לא נשמרת ב-DB.
 */
type DecisionState = {
  availableMinutes: TimeOptionMinutes;
  mood: MoodId | null;
  setAvailableMinutes: (minutes: TimeOptionMinutes) => void;
  toggleMood: (mood: MoodId) => void;
  reset: () => void;
};

const DEFAULT_MINUTES: TimeOptionMinutes = 60;

export const useDecisionStore = create<DecisionState>((set) => ({
  availableMinutes: DEFAULT_MINUTES,
  mood: null,
  setAvailableMinutes: (minutes) => set({ availableMinutes: minutes }),
  toggleMood: (mood) => set((state) => ({ mood: state.mood === mood ? null : mood })),
  reset: () => set({ availableMinutes: DEFAULT_MINUTES, mood: null }),
}));
