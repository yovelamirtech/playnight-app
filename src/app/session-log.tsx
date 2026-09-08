import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { t } from '@/i18n';
import { getLibraryEntry } from '@/db/repositories/gamesRepo';
import type { LibraryEntry } from '@/db/repositories/gamesRepo';
import {
  countCalibrationAnswersToday,
  getOptedOutOfCalibration,
  logSession,
} from '@/db/repositories/sessionsRepo';
import type { CalibrationAnswerValue } from '@/db/repositories/sessionsRepo';
import { SESSION_RATINGS } from '@/db/schema';
import type { SessionRating } from '@/db/schema';
import { shouldAskCalibrationQuestion } from '@/lib/calibration/pickQuestion';
import { useActiveSessionStore } from '@/store/useActiveSessionStore';

const CALIBRATION_OPTIONS: CalibrationAnswerValue[] = ['yes', 'no', 'depends'];

/** §3.5 — מסך לוג מהיר. שאלת הכיול #1 (§4.5) מוצגת רק כשהיא רלוונטית. */
export default function SessionLogScreen() {
  const router = useRouter();
  const userGameId = useActiveSessionStore((state) => state.userGameId);
  const startedAt = useActiveSessionStore((state) => state.startedAt);
  const initialNote = useActiveSessionStore((state) => state.stoppedNote);
  const clearActiveSession = useActiveSessionStore((state) => state.clear);

  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [askCalibration, setAskCalibration] = useState(false);
  const [rating, setRating] = useState<SessionRating | null>(null);
  const [calibrationAnswer, setCalibrationAnswer] = useState<CalibrationAnswerValue | null>(null);
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
    ]).then(([libraryEntry, todayCount, optedOut]) => {
      if (cancelled || !libraryEntry) return;
      setEntry(libraryEntry);
      setAskCalibration(
        shouldAskCalibrationQuestion({
          gameSessionReportsCount: libraryEntry.sessionReportsCount,
          calibrationQuestionsAnsweredTodayByUser: todayCount,
          userOptedOutOfCalibration: optedOut,
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
    await logSession({
      userGameId,
      startedAt: startedAt ? new Date(startedAt) : null,
      rating,
      calibrationAnswer: askCalibration ? calibrationAnswer : null,
      stoppedNote: note,
      finished,
    });
    clearActiveSession();
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
                label={`${t.game.ratingEmoji[value]} ${t.sessionLog.ratings[value]}`}
                selected={rating === value}
                onPress={() => setRating(value)}
              />
            ))}
          </View>
        </View>

        {askCalibration ? (
          <View className="gap-2">
            <Text className="text-base font-bold text-text">
              {t.sessionLog.calibrationQuestion}
            </Text>
            <View className="flex-row gap-2">
              {CALIBRATION_OPTIONS.map((value) => (
                <ChoiceChip
                  key={value}
                  label={t.sessionLog.calibrationOptions[value]}
                  selected={calibrationAnswer === value}
                  onPress={() => setCalibrationAnswer(value)}
                />
              ))}
            </View>
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
