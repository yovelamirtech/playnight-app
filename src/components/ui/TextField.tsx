import { Text, TextInput, View } from 'react-native';

import { palette } from '@/constants/theme';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  autoFocus?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoFocus = false,
}: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        className="h-12 rounded-xl border border-border bg-surface px-4 text-base text-text"
      />
    </View>
  );
}
