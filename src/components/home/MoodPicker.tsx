import { View } from 'react-native';

import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { MOODS } from '@/constants/session';
import type { MoodId } from '@/constants/session';
import { t } from '@/i18n';

type MoodPickerProps = {
  value: MoodId | null;
  onToggle: (mood: MoodId) => void;
};

const ROWS = [MOODS.slice(0, 3), MOODS.slice(3)];

/** מצב רוח הוא אופציונלי — טאפ שני על אותה בחירה מבטל אותה (§3.2). */
export function MoodPicker({ value, onToggle }: MoodPickerProps) {
  return (
    <View className="gap-3">
      {ROWS.map((row, index) => (
        <View key={index} className="flex-row gap-3">
          {row.map((mood) => (
            <ChoiceChip
              key={mood.id}
              label={`${mood.emoji} ${t.home.moods[mood.id]}`}
              selected={value === mood.id}
              onPress={() => onToggle(mood.id)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
