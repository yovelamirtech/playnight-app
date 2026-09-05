import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../global.css';
import { palette } from '@/constants/theme';
import { t } from '@/i18n';
import { useDatabaseReady } from '@/db/useDatabaseReady';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const { ready, error } = useDatabaseReady();

  useEffect(() => {
    if (ready || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready, error]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-center text-base text-text">
          {t.errors.databaseFailed(error.message)}
        </Text>
      </View>
    );
  }

  // בזמן המיגרציות המסך נשאר בספלאש — בלי ספינר ובלי הבהוב (§3.2).
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bg },
          animation: 'slide_from_right',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
    </SafeAreaProvider>
  );
}
