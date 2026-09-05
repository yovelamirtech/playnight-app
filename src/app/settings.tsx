import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { t } from '@/i18n';

export default function SettingsScreen() {
  return (
    <Screen>
      <ScreenHeader title={t.settings.title} />
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-muted">{t.settings.placeholder}</Text>
      </View>
    </Screen>
  );
}
