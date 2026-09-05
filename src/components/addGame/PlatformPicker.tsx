import { Pressable, ScrollView, Text } from 'react-native';

import { PLATFORMS } from '@/constants/session';
import type { PlatformName } from '@/constants/session';

type PlatformPickerProps = {
  value: PlatformName | null;
  onChange: (platform: PlatformName) => void;
};

export function PlatformPicker({ value, onChange }: PlatformPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {PLATFORMS.map((platform) => (
        <Pressable
          key={platform}
          accessibilityRole="button"
          accessibilityState={{ selected: value === platform }}
          onPress={() => onChange(platform)}
          className={`h-10 justify-center rounded-full border px-4 ${
            value === platform ? 'border-accent bg-accent/20' : 'border-border bg-surface'
          }`}
        >
          <Text className={value === platform ? 'font-bold text-text' : 'text-muted'}>
            {platform}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
