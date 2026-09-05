import { Pressable, Text } from 'react-native';

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** טאפ אחד, בלי מצב ביניים — הכפתורים במסך הבית גדולים בכוונה (§3.2). */
  size?: 'lg' | 'md';
};

export function ChoiceChip({ label, selected, onPress, size = 'md' }: ChoiceChipProps) {
  const height = size === 'lg' ? 'h-14' : 'h-12';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`${height} flex-1 items-center justify-center rounded-2xl border ${
        selected ? 'border-accent bg-accent/20' : 'border-border bg-surface'
      }`}
    >
      <Text
        className={`text-base ${selected ? 'font-bold text-text' : 'text-muted'}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
