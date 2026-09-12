import { ChipGrid } from '@/components/ui/ChipGrid';
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
    <ChipGrid
      rows={ROWS}
      keyFor={(mood) => mood.id}
      renderItem={(mood) => (
        <ChoiceChip
          icon={mood.icon}
          label={t.home.moods[mood.id]}
          selected={value === mood.id}
          onPress={() => onToggle(mood.id)}
        />
      )}
    />
  );
}
