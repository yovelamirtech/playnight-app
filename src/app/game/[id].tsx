import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Title } from '@/components/ui/Title';
import { RATING_ICONS } from '@/constants/ratingIcons';
import { palette } from '@/constants/theme';
import { t } from '@/i18n';
import type { LibraryEntry } from '@/db/repositories/gamesRepo';
import { getSessionHistory, getStoppedNotes } from '@/db/repositories/sessionsRepo';
import type { SessionRow } from '@/db/schema';
import { formatHltbHours } from '@/lib/hltb/formatHours';
import { useLibraryEntry } from '@/lib/library/useLibraryEntry';
import { formatTimeAgo } from '@/lib/timeAgo';
import { useActiveSessionStore } from '@/store/useActiveSessionStore';

const hasHltbData = (entry: LibraryEntry): boolean =>
  entry.hltbMainStoryMinutes != null ||
  entry.hltbMainExtraMinutes != null ||
  entry.hltbCompletionistMinutes != null;

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const beginSession = useActiveSessionStore((state) => state.begin);
  const { entry, loading } = useLibraryEntry(id);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [notes, setNotes] = useState<SessionRow[]>([]);
  const loaded = !loading;

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    getSessionHistory(entry.gameId).then((rows) => !cancelled && setSessions(rows));
    getStoppedNotes(entry.gameId).then((rows) => !cancelled && setNotes(rows));
    return () => {
      cancelled = true;
    };
  }, [entry]);

  const playNow = () => {
    beginSession(id);
    router.push('/session-confirm');
  };

  if (loaded && !entry) {
    return (
      <Screen>
        <ScreenHeader title="" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">{t.game.notFound}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="" />
      <ScrollView contentContainerClassName="gap-6 pb-10">
        <Title>{entry?.name ?? ''}</Title>
        <View className="gap-1">
          {entry?.releaseYear ? (
            <Text className="text-center text-base text-muted">{entry.releaseYear}</Text>
          ) : null}
          {entry?.platform ? (
            <Text className="text-center text-base text-muted">{entry.platform}</Text>
          ) : null}
          {entry && entry.hoursPlayed > 0 ? (
            <Text className="text-center text-base text-muted">
              {t.game.hoursPlayed(entry.hoursPlayed)}
            </Text>
          ) : null}
        </View>

        {entry ? <PrimaryButton label={t.game.playNow} onPress={playNow} /> : null}

        {entry && hasHltbData(entry) ? (
          <Card className="gap-2">
            <Text className="text-base font-bold text-text">{t.game.timeToBeatTitle}</Text>
            <View className="flex-row justify-between">
              {formatHltbHours(entry.hltbMainStoryMinutes) ? (
                <View className="items-center gap-0.5">
                  <Text className="text-sm font-bold text-text">
                    {formatHltbHours(entry.hltbMainStoryMinutes)}
                  </Text>
                  <Text className="text-xs text-muted">{t.game.timeToBeatMain}</Text>
                </View>
              ) : null}
              {formatHltbHours(entry.hltbMainExtraMinutes) ? (
                <View className="items-center gap-0.5">
                  <Text className="text-sm font-bold text-text">
                    {formatHltbHours(entry.hltbMainExtraMinutes)}
                  </Text>
                  <Text className="text-xs text-muted">{t.game.timeToBeatExtra}</Text>
                </View>
              ) : null}
              {formatHltbHours(entry.hltbCompletionistMinutes) ? (
                <View className="items-center gap-0.5">
                  <Text className="text-sm font-bold text-text">
                    {formatHltbHours(entry.hltbCompletionistMinutes)}
                  </Text>
                  <Text className="text-xs text-muted">{t.game.timeToBeatCompletionist}</Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        <Card className="gap-2">
          <Text className="text-base font-bold text-text">{t.game.notesTitle}</Text>
          {notes.length === 0 ? (
            <Text className="text-sm text-muted">{t.game.noNotes}</Text>
          ) : (
            notes.map((session) => (
              <View key={session.id} className="gap-0.5">
                <Text className="text-xs text-muted">
                  {formatTimeAgo(session.endedAt ?? session.startedAt)}
                </Text>
                <Text className="text-sm text-text">{session.stoppedNote}</Text>
              </View>
            ))
          )}
        </Card>

        <Card className="gap-2">
          <Text className="text-base font-bold text-text">{t.game.sessionsTitle}</Text>
          {sessions.length === 0 ? (
            <Text className="text-sm text-muted">{t.game.noSessions}</Text>
          ) : (
            sessions.map((session) => {
              const RatingIcon = session.rating ? RATING_ICONS[session.rating] : null;
              return (
                <View key={session.id} className="flex-row items-center gap-1.5">
                  {RatingIcon ? <RatingIcon size={14} color={palette.muted} /> : null}
                  <Text className="text-sm text-muted">
                    {t.game.sessionEntry(
                      formatTimeAgo(session.endedAt ?? session.startedAt),
                      session.durationMinutes
                    )}
                  </Text>
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
