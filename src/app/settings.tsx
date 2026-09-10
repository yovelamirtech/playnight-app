import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SyncSection } from '@/components/settings/SyncSection';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { t } from '@/i18n';
import { getOptedOutOfCalibration, setOptedOutOfCalibration } from '@/db/repositories/sessionsRepo';

export default function SettingsScreen() {
  const router = useRouter();
  const [optedOut, setOptedOut] = useState<boolean | null>(null);

  useEffect(() => {
    getOptedOutOfCalibration().then(setOptedOut);
  }, []);

  const toggleOptOut = async () => {
    const next = !optedOut;
    setOptedOut(next);
    await setOptedOutOfCalibration(next);
  };

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

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: optedOut ?? false }}
          onPress={toggleOptOut}
          disabled={optedOut === null}
          className={`justify-center gap-1 rounded-2xl border px-4 py-3 ${
            optedOut ? 'border-accent bg-accent/20' : 'border-border bg-surface'
          }`}
        >
          <Text className="text-base text-text">{t.settings.calibrationOptOut}</Text>
          <Text className="text-xs text-muted">{t.settings.calibrationOptOutHint}</Text>
        </Pressable>

        <SyncSection />
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-muted">{t.settings.placeholder}</Text>
      </View>
    </Screen>
  );
}
