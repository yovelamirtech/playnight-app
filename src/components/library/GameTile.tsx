import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { LibraryEntry } from '@/db/repositories/gamesRepo';

type GameTileProps = {
  entry: LibraryEntry;
  onPress: () => void;
};

export function GameTile({ entry, onPress }: GameTileProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-1 p-1.5">
      <View className="aspect-[3/4] overflow-hidden rounded-xl border border-border bg-surface">
        {entry.coverUrl ? (
          <Image source={{ uri: entry.coverUrl }} style={{ flex: 1 }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center px-2">
            <Text className="text-center text-xs text-muted" numberOfLines={4}>
              {entry.name}
            </Text>
          </View>
        )}
      </View>
      <Text className="mt-1 text-xs text-text" numberOfLines={1}>
        {entry.name}
      </Text>
      {entry.platform ? (
        <Text className="text-xs text-muted" numberOfLines={1}>
          {entry.platform}
        </Text>
      ) : null}
    </Pressable>
  );
}
