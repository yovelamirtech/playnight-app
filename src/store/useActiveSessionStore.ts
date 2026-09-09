import { create } from 'zustand';

/**
 * הסשן הפעיל (§3.4→§3.5) — עובר ממסך האישור למסך הלוג המהיר בלי
 * לשמור שום דבר ל-DB עד "סיימתי לשחק". מוחזק בזיכרון בלבד, כמו
 * useDecisionStore.
 */
type ActiveSessionState = {
  userGameId: string | null;
  startedAt: number | null;
  stoppedNote: string;
  begin: (userGameId: string) => void;
  startTimer: (startedAt?: number) => void;
  setStoppedNote: (note: string) => void;
  clear: () => void;
};

export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  userGameId: null,
  startedAt: null,
  stoppedNote: '',
  begin: (userGameId) => set({ userGameId, startedAt: null, stoppedNote: '' }),
  startTimer: (startedAt = Date.now()) => set({ startedAt }),
  setStoppedNote: (stoppedNote) => set({ stoppedNote }),
  clear: () => set({ userGameId: null, startedAt: null, stoppedNote: '' }),
}));
