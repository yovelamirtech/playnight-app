import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { t } from '@/i18n';
import { createMockIgdbGateway, getIgdbGateway, isIgdbConfigured } from '@/lib/igdb';
import type { IgdbGame } from '@/lib/igdb';

type SearchListProps = {
  onSelect: (game: IgdbGame) => void;
};

type Source = 'live' | 'offline' | 'fallback';

/** ה-UI מדבר רק מול IgdbGateway — mock בלי פרוקסי, HTTP איתו. */
export function SearchList({ onSelect }: SearchListProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IgdbGame[]>([]);
  const [source, setSource] = useState<Source>(isIgdbConfigured() ? 'live' : 'offline');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const games = await getIgdbGateway().searchGames(query, { signal: controller.signal });
          setResults(games);
          setSource(isIgdbConfigured() ? 'live' : 'offline');
          setFailed(false);
        } catch {
          if (controller.signal.aborted) return;
          // בפיתוח הטלפון לא תמיד מגיע לפרוקסי (למשל בהרצת --tunnel).
          // עדיף להמשיך לעבוד על נתוני דוגמה מאשר לחסום את כל המסך.
          if (__DEV__) {
            setResults(await createMockIgdbGateway().searchGames(query));
            setSource('fallback');
            setFailed(false);
            return;
          }
          setResults([]);
          setFailed(true);
        }
      })();
    }, 250); // IGDB מוגבל ל-4 בקשות לשנייה (§7) — לא שולחים על כל תו.

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <View className="flex-1 gap-4 pt-4">
      <TextField
        label={t.addGame.searchLabel}
        value={query}
        onChangeText={setQuery}
        placeholder="Hades"
      />
      {source === 'offline' ? (
        <Text className="text-sm text-muted">{t.addGame.searchHint}</Text>
      ) : null}
      {source === 'fallback' ? (
        <Text className="text-sm text-warn">{t.addGame.searchFallback}</Text>
      ) : null}
      {failed ? <Text className="text-sm text-warn">{t.addGame.searchFailed}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.igdbId)}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-2 pb-8"
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelect(item)}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <Text className="text-base text-text">{item.name}</Text>
            <Text className="text-sm text-muted">
              {[item.releaseYear, item.genres[0]].filter(Boolean).join(' · ')}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
