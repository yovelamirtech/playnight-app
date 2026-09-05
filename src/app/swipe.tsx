import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Title } from '@/components/ui/Title';
import { t } from '@/i18n';
import { useDecisionStore } from '@/store/useDecisionStore';

/** שלד בלבד. מנוע ההמלצה והכרטיסים נבנים בשלב 2 (§3.3, §4.1). */
export default function SwipeScreen() {
  const availableMinutes = useDecisionStore((state) => state.availableMinutes);
  const mood = useDecisionStore((state) => state.mood);

  const timeLabel = t.home.timeOptions[availableMinutes];
  const moodLabel = mood ? t.home.moods[mood] : t.swipe.noMood;

  return (
    <Screen>
      <ScreenHeader title={t.swipe.title} />
      <View className="flex-1 items-center justify-center gap-4">
        <Title>{timeLabel}</Title>
        <Text className="text-base text-muted">{t.swipe.moodLine(moodLabel)}</Text>
        <Text className="text-center text-base text-muted">{t.swipe.placeholder}</Text>
      </View>
    </Screen>
  );
}
