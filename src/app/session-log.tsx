import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { CalibrationQuestion } from '@/components/sessionLog/CalibrationQuestion';
import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { RATING_ICONS } from '@/constants/ratingIcons';
import { t } from '@/i18n';
import { countStoppedNotes, getTotalSessionsCount } from '@/db/repositories/entitlementsRepo';
import { getLibraryEntry } from '@/db/repositories/gamesRepo';
import type { LibraryEntry } from '@/db/repositories/gamesRepo';
import { getIsPro } from '@/db/repositories/proRepo';
import {
  countCalibrationAnswersToday,
  getOptedOutOfCalibration,
  getRotatingQuestionAnsweredCounts,
  logSession,
} from '@/db/repositories/sessionsRepo';
import type { CalibrationAnswerRawValue } from '@/db/repositories/sessionsRepo';
import { SESSION_RATINGS } from '@/db/schema';
import type { SessionRating } from '@/db/schema';
import { pickCalibrationQuestionId, shouldAskCalibrationQuestion } from '@/lib/calibration/pickQuestion';
import type { CalibrationQuestionId } from '@/lib/calibration/pickQuestion';
import { canAddStoppedNote } from '@/lib/entitlements/limits';
import { useActiveSessionStore } from '@/store/useActiveSessionStore';

/** §3.5 — מסך לוג מהיר. שאלת כיול אחת (§4.5, רוטציה בין הבנק) מוצגת רק כשהיא רלוונטית. */
export default function SessionLogScreen() {
  const router = useRouter();
  const userGameId = useActiveSessionStore((state) => state.userGameId);
  const startedAt = useActiveSessionStore((state) => state.startedAt);
  const initialNote = useActiveSessionStore((state) => state.stoppedNote);
  const clearActiveSession = useActiveSessionStore((state) => state.clear);

  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [questionId, setQuestionId] = useState<CalibrationQuestionId | null>(null);
  const [rating, setRating] = useState<SessionRating | null>(null);
  const [calibrationAnswer, setCalibrationAnswer] = useState<CalibrationAnswerRawValue | null>(null);
  const [note, setNote] = useState(initialNote);
  const [finished, setFinished] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userGameId) return;
    let cancelled = false;
    Promise.all([
      getLibraryEntry(userGameId),
      countCalibrationAnswersToday(),
      getOptedOutOfCalibration(),
    ]).then(async ([libraryEntry, todayCount, optedOut]) => {
      if (cancelled || !libraryEntry) return;
      setEntry(libraryEntry);
      const askCalibration = shouldAskCalibrationQuestion({
        gameSessionReportsCount: libraryEntry.sessionReportsCount,
        calibrationQuestionsAnsweredTodayByUser: todayCount,
        userOptedOutOfCalibration: optedOut,
      });
      if (!askCalibration) return;
      const rotatingCounts = await getRotatingQuestionAnsweredCounts(libraryEntry.gameId);
      if (cancelled) return;
      setQuestionId(
        pickCalibrationQuestionId({
          interruptibleReportsCount: libraryEntry.interruptibleReportsCount,
          questionAnsweredCounts: rotatingCounts,
        })
      );
    });
    return () => {
      cancelled = true;
    };
  }, [userGameId]);

  const skip = () => {
    clearActiveSession();
    router.replace('/');
  };

  const submit = async () => {
    if (!userGameId || !rating || finished === null || submitting) return;
    setSubmitting(true);

    const isPro = await getIsPro();
    const [priorSessionsCount, priorNotesCount] = await Promise.all([
      getTotalSessionsCount(),
      countStoppedNotes(),
    ]);
    // §5 — 20 הערות "איפה עצרתי" בחינם. הסשן עצמו לא נחסם, רק ההערה.
    const noteAllowed = !note.trim() || canAddStoppedNote(priorNotesCount, isPro);

    await logSession({
      userGameId,
      startedAt: startedAt ? new Date(startedAt) : null,
      rating,
      calibrationAnswer: questionId && calibrationAnswer ? { questionId, value: calibrationAnswer } : null,
      stoppedNote: noteAllowed ? note : '',
      finished,
    });
    clearActiveSession();

    // §5 — ה-paywall מוצג אחרי הסשן הראשון, לא לפני. גם נפתח אם ההערה נחסמה.
    // מעביר gameId כדי ש-paywall.tsx ידע לאן "Not now" חוזר — לא back(),
    // כי useActiveSessionStore כבר נוקה (clearActiveSession למעלה) והמסך
    // הקודם ב-stack (session-confirm) נשאר בלי סשן פעיל ומציג מסך ריק.
    if (!noteAllowed) {
      router.replace({ pathname: '/paywall', params: { reason: 'notes', gameId: userGameId } });
      return;
    }
    if (!isPro && priorSessionsCount === 0) {
      router.replace({ pathname: '/paywall', params: { reason: 'firstSession', gameId: userGameId } });
      return;
    }
    router.replace({ pathname: '/game/[id]', params: { id: userGameId } });
  };

  if (!userGameId || !entry) return <Screen>{null}</Screen>;

  const canSubmit = rating !== null && finished !== null && !submitting;

  return (
    <Screen>
      <ScreenHeader title={t.sessionLog.title} />
      <View className="flex-1 gap-6 pb-4 pt-2">
        <View className="gap-2">
          <Text className="text-base font-bold text-text">{t.sessionLog.ratingQuestion}</Text>
          <View className="flex-row gap-2">
            {SESSION_RATINGS.map((value) => (
              <ChoiceChip
                key={value}
                icon={RATING_ICONS[value]}
                label={t.sessionLog.ratings[value]}
                selected={rating === value}
                onPress={() => setRating(value)}
              />
            ))}
          </View>
        </View>

        {questionId ? (
          <View className="gap-2">
            <Text className="text-base font-bold text-text">
              {t.sessionLog.calibrationQuestions[questionId].question}
            </Text>
            <CalibrationQuestion
              questionId={questionId}
              value={calibrationAnswer}
              onChange={setCalibrationAnswer}
            />
            {calibrationAnswer ? (
              <Text className="text-xs text-muted">
                {t.sessionLog.calibrationThanks(entry.name)}
              </Text>
            ) : null}
          </View>
        ) : null}

        <TextField
          label={t.sessionLog.noteLabel}
          value={note}
          onChangeText={setNote}
          placeholder={t.sessionLog.notePlaceholder}
        />

        <View className="gap-2">
          <Text className="text-base font-bold text-text">{t.sessionLog.finishedQuestion}</Text>
          <View className="flex-row gap-2">
            <ChoiceChip label={t.sessionLog.yes} selected={finished === true} onPress={() => setFinished(true)} />
            <ChoiceChip label={t.sessionLog.no} selected={finished === false} onPress={() => setFinished(false)} />
          </View>
        </View>

        <View className="flex-1 justify-end gap-3">
          <PrimaryButton label={t.sessionLog.submit} onPress={submit} disabled={!canSubmit} />
          <PrimaryButton label={t.sessionLog.skip} onPress={skip} />
        </View>
      </View>
    </Screen>
  );
}
