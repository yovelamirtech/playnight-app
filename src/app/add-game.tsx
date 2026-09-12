import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ManualForm } from '@/components/addGame/ManualForm';
import { SearchList } from '@/components/addGame/SearchList';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { selectedPillClassName } from '@/components/ui/selectedPill';
import { t } from '@/i18n';
import { addGameFromIgdb, addManualGame, LibraryLimitReachedError } from '@/db/repositories/gamesRepo';

type Mode = 'search' | 'manual';

export default function AddGameScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('search');

  const done = () => router.replace('/library');

  const onLimitReached = (error: unknown) => {
    if (error instanceof LibraryLimitReachedError) {
      router.push({ pathname: '/paywall', params: { reason: 'library' } });
      return;
    }
    throw error;
  };

  return (
    <Screen>
      <ScreenHeader title={t.addGame.title} />
      <View className="flex-row gap-2">
        {(['search', 'manual'] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === option }}
            onPress={() => setMode(option)}
            className={`h-10 flex-1 items-center justify-center rounded-full border ${selectedPillClassName(mode === option)}`}
          >
            <Text className={mode === option ? 'font-bold text-text' : 'text-muted'}>
              {option === 'search' ? t.addGame.searchTab : t.addGame.manualTab}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'search' ? (
        <SearchList
          onSelect={(game) => {
            void addGameFromIgdb(game, null).then(done).catch(onLimitReached);
          }}
        />
      ) : (
        <ManualForm
          onSubmit={(input) => {
            void addManualGame(input).then(done).catch(onLimitReached);
          }}
        />
      )}
    </Screen>
  );
}
