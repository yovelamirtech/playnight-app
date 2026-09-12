import { ChipGrid } from '@/components/ui/ChipGrid';
import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { TIME_OPTIONS } from '@/constants/session';
import type { TimeOptionMinutes } from '@/constants/session';
import { t } from '@/i18n';

type TimePickerProps = {
  value: TimeOptionMinutes;
  onChange: (minutes: TimeOptionMinutes) => void;
};

const ROWS = [TIME_OPTIONS.slice(0, 2), TIME_OPTIONS.slice(2)];

/** ארבע אפשרויות, טאפ אחד, בלי גלילה (§3.2). */
export function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <ChipGrid
      rows={ROWS}
      keyFor={(minutes) => minutes}
      renderItem={(minutes) => (
        <ChoiceChip
          size="lg"
          label={t.home.timeOptions[minutes]}
          selected={value === minutes}
          onPress={() => onChange(minutes)}
        />
      )}
    />
  );
}
