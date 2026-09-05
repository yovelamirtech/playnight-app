import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ManualForm } from '@/components/addGame/ManualForm';
import { SearchList } from '@/components/addGame/SearchList';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { t } from '@/i18n';
import { addGameFromIgdb, addManualGame } from '@/db/repositories/gamesRepo';

type Mode = 'search' | 'manual';

export default function AddGameScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('search');

  const done = () => router.replace('/library');

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
            className={`h-10 flex-1 items-center justify-center rounded-full border ${
              mode === option ? 'border-accent bg-accent/20' : 'border-border bg-surface'
            }`}
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
            void addGameFromIgdb(game, null).then(done);
          }}
        />
      ) : (
        <ManualForm
          onSubmit={(input) => {
            void addManualGame(input).then(done);
          }}
        />
      )}
    </Screen>
  );
}
