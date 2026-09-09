import { Image } from 'expo-image';
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
  cancelSessionEndNotification,
  scheduleSessionEndNotification,
} from '@/lib/sessionTimer/notifications';
import { useActiveSessionStore } from '@/store/useActiveSessionStore';

const DURATION_PRESETS_MINUTES = [15, 20, 30, 45, 60];

/**
 * §3.4 — מסך אישור "משחקים!". נכנסים אליו אחרי ש-useActiveSessionStore.begin
 * כבר נקרא (swipe ימינה או "אני משחק בזה" מפרטי המשחק).
 */
export default function SessionConfirmScreen() {
  const router = useRouter();
  const userGameId = useActiveSessionStore((state) => state.userGameId);
  const startedAt = useActiveSessionStore((state) => state.startedAt);
  const stoppedNote = useActiveSessionStore((state) => state.stoppedNote);
  const startTimer = useActiveSessionStore((state) => state.startTimer);
  const setStoppedNote = useActiveSessionStore((state) => state.setStoppedNote);

  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [notificationId, setNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (!userGameId) return;
    let cancelled = false;
    getLibraryEntry(userGameId).then((result) => {
      if (!cancelled) setEntry(result);
    });
    return () => {
      cancelled = true;
    };
  }, [userGameId]);

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  useEffect(() => {
    // מבטל אם המשתמש עוזב את המסך בלי "סיימתי לשחק" (למשל back) — לא
    // רוצים התראה על סשן שכבר לא במעקב.
    return () => {
      cancelSessionEndNotification(notificationId);
    };
  }, [notificationId]);

  if (!userGameId || !entry) return <Screen>{null}</Screen>;

  const totalMinutes = selectedMinutes ?? entry.typicalSessionMinutes;
  const elapsedMinutes = startedAt !== null ? (nowTick - startedAt) / 60_000 : 0;
  const remainingMinutes = startedAt !== null ? Math.ceil(totalMinutes - elapsedMinutes) : null;

  const goToLog = () => {
    cancelSessionEndNotification(notificationId);
    setNotificationId(null);
    router.push('/session-log');
  };

  const handleStart = () => {
    const now = Date.now();
    startTimer(now);
    setNowTick(now);
    scheduleSessionEndNotification(entry.name, new Date(now + totalMinutes * 60_000)).then(
      setNotificationId
    );
  };

  return (
    <Screen>
      <ScreenHeader title={t.sessionConfirm.title} />
      <View className="flex-1 items-center gap-6 pt-4">
        {entry.coverUrl ? (
          <Image
            source={{ uri: entry.coverUrl }}
            style={{ width: 160, height: 213, borderRadius: 16 }}
            contentFit="cover"
          />
        ) : null}
        <Text className="text-center text-xl font-bold text-text">
          {t.sessionConfirm.enjoy(entry.name)}
        </Text>

        {startedAt === null ? (
          <View className="w-full items-center gap-3">
            <Text className="text-sm text-muted">{t.sessionConfirm.durationLabel}</Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {DURATION_PRESETS_MINUTES.map((minutes) => (
                <View key={minutes} style={{ width: 68 }}>
                  <ChoiceChip
                    label={t.sessionConfirm.minutesLabel(minutes)}
                    selected={totalMinutes === minutes}
                    onPress={() => setSelectedMinutes(minutes)}
                  />
                </View>
              ))}
            </View>
            <PrimaryButton
              label={t.sessionConfirm.startSession(totalMinutes)}
              onPress={handleStart}
            />
          </View>
        ) : (
          <Text className="text-base text-accentSoft">
            {t.sessionConfirm.running(remainingMinutes ?? 0)}
          </Text>
        )}

        <View className="w-full">
          <TextField
            label={t.sessionConfirm.noteLabel}
            value={stoppedNote}
            onChangeText={setStoppedNote}
            placeholder={t.sessionConfirm.notePlaceholder}
          />
        </View>

        <View className="w-full flex-1 justify-end pb-4">
          <PrimaryButton label={t.sessionConfirm.donePlaying} onPress={goToLog} />
        </View>
      </View>
    </Screen>
  );
}
