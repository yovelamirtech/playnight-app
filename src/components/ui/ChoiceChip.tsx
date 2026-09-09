import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

// תואם לצבעי text/muted ב-tailwind.config.js — RN לא מיישם className על ה-stroke של אייקוני SVG.
const TEXT_COLOR = '#F2F4F8';
const MUTED_COLOR = '#8B93A3';

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
  const color = selected ? TEXT_COLOR : MUTED_COLOR;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`${height} flex-1 items-center justify-center rounded-2xl border ${
        selected ? 'border-accent bg-accent/20' : 'border-border bg-surface'
      }`}
    >
      <View className="flex-row items-center gap-2">
        {Icon ? <Icon size={18} color={color} strokeWidth={selected ? 2.25 : 2} /> : null}
        <Text
          className={`text-base ${selected ? 'font-bold text-text' : 'text-muted'}`}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
