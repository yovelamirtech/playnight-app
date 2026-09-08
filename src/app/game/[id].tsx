import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Title } from '@/components/ui/Title';
import { t } from '@/i18n';
import { getLibraryEntry } from '@/db/repositories/gamesRepo';
import type { LibraryEntry } from '@/db/repositories/gamesRepo';
import { getSessionHistory, getStoppedNotes } from '@/db/repositories/sessionsRepo';
import type { SessionRow } from '@/db/schema';
import { formatTimeAgo } from '@/lib/timeAgo';
import { useActiveSessionStore } from '@/store/useActiveSessionStore';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const beginSession = useActiveSessionStore((state) => state.begin);
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [notes, setNotes] = useState<SessionRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLibraryEntry(id).then((result) => {
      if (cancelled) return;
      setEntry(result);
      setLoaded(true);
      if (result) {
        getSessionHistory(result.gameId).then((rows) => !cancelled && setSessions(rows));
        getStoppedNotes(result.gameId).then((rows) => !cancelled && setNotes(rows));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

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

        <View className="gap-2 rounded-2xl border border-border bg-surface p-4">
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
        </View>

        <View className="gap-2 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-base font-bold text-text">{t.game.sessionsTitle}</Text>
          {sessions.length === 0 ? (
            <Text className="text-sm text-muted">{t.game.noSessions}</Text>
          ) : (
            sessions.map((session) => (
              <Text key={session.id} className="text-sm text-muted">
                {session.rating ? t.game.ratingEmoji[session.rating] : ''}{' '}
                {t.game.sessionEntry(
                  formatTimeAgo(session.endedAt ?? session.startedAt),
                  session.durationMinutes
                )}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
