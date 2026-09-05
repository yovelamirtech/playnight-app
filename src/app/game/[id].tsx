import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Title } from '@/components/ui/Title';
import { t } from '@/i18n';
import { getLibraryEntry } from '@/db/repositories/gamesRepo';
import type { LibraryEntry } from '@/db/repositories/gamesRepo';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLibraryEntry(id).then((result) => {
      if (cancelled) return;
      setEntry(result);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

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
        </View>

        <View className="gap-2 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-base font-bold text-text">{t.game.notesTitle}</Text>
          <Text className="text-sm text-muted">{t.game.noNotes}</Text>
        </View>

        <View className="gap-2 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-base font-bold text-text">{t.game.sessionsTitle}</Text>
          <Text className="text-sm text-muted">{t.game.noSessions}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
