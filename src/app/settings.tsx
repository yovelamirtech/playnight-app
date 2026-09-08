import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { t } from '@/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <Screen>
      <ScreenHeader title={t.settings.title} />
      <View className="gap-4 pt-4">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/connect-steam')}
          className="h-14 justify-center rounded-2xl border border-border bg-surface px-4"
        >
          <Text className="text-base text-text">{t.settings.connectSteam}</Text>
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-muted">{t.settings.placeholder}</Text>
      </View>
    </Screen>
  );
}
