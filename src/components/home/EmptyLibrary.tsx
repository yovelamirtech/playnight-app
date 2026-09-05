import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Subtitle, Title } from '@/components/ui/Title';
import { t } from '@/i18n';

/** Empty state של מסך הבית (§3.2) — כפתור אחד גדול, בלי רשימות. */
export function EmptyLibrary() {
  const router = useRouter();
  return (
    <View className="gap-6">
      <Title>{t.home.emptyTitle}</Title>
      <Subtitle>{t.home.emptyBody}</Subtitle>
      <PrimaryButton label={t.home.emptyAdd} onPress={() => router.push('/add-game')} />
      <Text className="text-center text-sm text-muted">{t.home.steamComingSoon}</Text>
    </View>
  );
}
