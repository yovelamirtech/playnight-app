import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { selectedPillClassName } from '@/components/ui/selectedPill';
import { palette } from '@/constants/theme';

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  /** טאפ אחד, בלי מצב ביניים — הכפתורים במסך הבית גדולים בכוונה (§3.2). */
  size?: 'lg' | 'md';
};

export function ChoiceChip({ label, selected, onPress, icon: Icon, size = 'md' }: ChoiceChipProps) {
  const height = size === 'lg' ? 'h-14' : 'h-12';
  const color = selected ? palette.text : palette.muted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`${height} flex-1 items-center justify-center rounded-2xl border px-2 ${selectedPillClassName(selected)}`}
    >
      <View className="flex-row items-center gap-2">
        {Icon ? <Icon size={18} color={color} strokeWidth={selected ? 2.25 : 2} /> : null}
        <Text
          className={`text-center text-sm ${selected ? 'font-bold text-text' : 'text-muted'}`}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
