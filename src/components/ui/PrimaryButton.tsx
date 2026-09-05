import { Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`h-14 items-center justify-center rounded-2xl ${
        disabled ? 'bg-surfaceAlt' : 'bg-accent active:bg-accentSoft'
      }`}
    >
      <Text className={`text-lg font-bold ${disabled ? 'text-muted' : 'text-white'}`}>{label}</Text>
    </Pressable>
  );
}
