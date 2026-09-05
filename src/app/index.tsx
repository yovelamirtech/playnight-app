import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { EmptyLibrary } from '@/components/home/EmptyLibrary';
import { MoodPicker } from '@/components/home/MoodPicker';
import { TimePicker } from '@/components/home/TimePicker';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { Title } from '@/components/ui/Title';
import { t } from '@/i18n';
import { db } from '@/db/client';
import { userGames } from '@/db/schema';
import { useDecisionStore } from '@/store/useDecisionStore';

export default function HomeScreen() {
  const router = useRouter();
  const availableMinutes = useDecisionStore((state) => state.availableMinutes);
  const mood = useDecisionStore((state) => state.mood);
  const setAvailableMinutes = useDecisionStore((state) => state.setAvailableMinutes);
  const toggleMood = useDecisionStore((state) => state.toggleMood);

  // live query — הספרייה מקומית, אין קריאת רשת ואין ספינר.
  const { data } = useLiveQuery(db.select({ id: userGames.id }).from(userGames));
  const isEmpty = data.length === 0;

  return (
    <Screen center>
      {isEmpty ? (
        <EmptyLibrary />
      ) : (
        <View className="gap-8">
          <View className="gap-4">
            <Title>{t.home.timeQuestion}</Title>
            <TimePicker value={availableMinutes} onChange={setAvailableMinutes} />
          </View>

          <View className="gap-4">
            <Title className="text-lg">{t.home.moodQuestion}</Title>
            <MoodPicker value={mood} onToggle={toggleMood} />
          </View>

          <PrimaryButton label={t.home.cta} onPress={() => router.push('/swipe')} />
        </View>
      )}

      <View className="mt-10 flex-row justify-center gap-6">
        <Pressable onPress={() => router.push('/library')}>
          <Text className="text-base text-muted">{t.nav.library}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/settings')}>
          <Text className="text-base text-muted">{t.nav.settings}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
