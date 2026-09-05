import { and, desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { GameTile } from '@/components/library/GameTile';
import { LibraryTabs } from '@/components/library/LibraryTabs';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { t } from '@/i18n';
import { LOCAL_USER_ID } from '@/db/bootstrap';
import { db } from '@/db/client';
import { games, userGames } from '@/db/schema';
import type { UserGameStatus } from '@/db/schema';

export default function LibraryScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<UserGameStatus>('backlog');

  const { data } = useLiveQuery(
    db
      .select({
        userGameId: userGames.id,
        gameId: games.id,
        name: games.name,
        coverUrl: games.coverUrl,
        releaseYear: games.releaseYear,
        platform: userGames.platform,
        status: userGames.status,
        genres: games.genres,
        typicalSessionMinutes: games.typicalSessionMinutes,
        interruptible: games.interruptible,
      })
      .from(userGames)
      .innerJoin(games, eq(userGames.gameId, games.id))
      .where(and(eq(userGames.userId, LOCAL_USER_ID), eq(userGames.status, status)))
      .orderBy(desc(userGames.addedAt)),
    [status],
  );

  return (
    <Screen>
      <ScreenHeader
        title={t.library.title}
        action={{ label: t.library.add, onPress: () => router.push('/add-game') }}
      />
      <LibraryTabs value={status} onChange={setStatus} />

      {data.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">{t.library.empty}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.userGameId}
          numColumns={3}
          contentContainerClassName="pb-8"
          renderItem={({ item }) => (
            <GameTile
              entry={item}
              onPress={() => router.push({ pathname: '/game/[id]', params: { id: item.userGameId } })}
            />
          )}
        />
      )}
    </Screen>
  );
}
