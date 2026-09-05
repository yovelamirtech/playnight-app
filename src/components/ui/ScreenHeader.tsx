import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { t } from '@/i18n';

type ScreenHeaderProps = {
  title: string;
  action?: { label: string; onPress: () => void };
};

export function ScreenHeader({ title, action }: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <View className="h-14 flex-row items-center justify-between">
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <Text className="text-base text-muted">{`‹ ${t.nav.back}`}</Text>
      </Pressable>
      <Text className="text-lg font-bold text-text">{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} accessibilityRole="button">
          <Text className="text-base text-accentSoft">{action.label}</Text>
        </Pressable>
      ) : (
        <View className="w-14" />
      )}
    </View>
  );
}
