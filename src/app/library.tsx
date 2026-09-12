import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { GameTile } from '@/components/library/GameTile';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { LibraryTabs } from '@/components/library/LibraryTabs';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { t } from '@/i18n';
import { LOCAL_USER_ID } from '@/db/bootstrap';
import { db } from '@/db/client';
import { LIBRARY_COLUMNS } from '@/db/repositories/gamesRepo';
import { games, userGames } from '@/db/schema';
import type { UserGameStatus } from '@/db/schema';
import { EMPTY_LIBRARY_FILTERS, filterLibrary, sortLibrary } from '@/lib/library/filterSort';
import type { LibraryFilters as Filters, SortOption } from '@/lib/library/filterSort';

export default function LibraryScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<UserGameStatus>('backlog');
  const [filters, setFilters] = useState<Filters>(EMPTY_LIBRARY_FILTERS);
  const [sort, setSort] = useState<SortOption>('recent');

  const { data } = useLiveQuery(
    db
      .select({
        ...LIBRARY_COLUMNS,
        communityRating: games.communityRating,
        addedAt: userGames.addedAt,
        lastPlayedAt: userGames.lastPlayedAt,
      })
      .from(userGames)
      .innerJoin(games, eq(userGames.gameId, games.id))
      .where(and(eq(userGames.userId, LOCAL_USER_ID), eq(userGames.status, status))),
    [status],
  );

  // אפשרויות הפילטרים (§3.6) נגזרות מהטאב הנוכחי בלבד — לא נטענות מראש.
  const platforms = useMemo(
    () => Array.from(new Set(data.map((row) => row.platform).filter((v): v is string => !!v))).sort(),
    [data],
  );
  const genres = useMemo(
    () => Array.from(new Set(data.flatMap((row) => row.genres))).sort(),
    [data],
  );
  const years = useMemo(
    () =>
      Array.from(new Set(data.map((row) => row.releaseYear).filter((v): v is number => v != null))).sort(
        (a, b) => b - a,
      ),
    [data],
  );

  const visibleGames = useMemo(
    () => sortLibrary(filterLibrary(data, filters), sort),
    [data, filters, sort],
  );

  return (
    <Screen>
      <ScreenHeader
        title={t.library.title}
        action={{ label: t.library.add, onPress: () => router.push('/add-game') }}
      />
      <LibraryTabs value={status} onChange={setStatus} />
      <LibraryFilters
        platforms={platforms}
        genres={genres}
        years={years}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
      />

      {visibleGames.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">{t.library.empty}</Text>
        </View>
      ) : (
        <FlatList
          data={visibleGames}
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
