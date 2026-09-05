import { Pressable, ScrollView, Text } from 'react-native';

import { t } from '@/i18n';
import type { UserGameStatus } from '@/db/schema';

export const LIBRARY_TABS: { status: UserGameStatus; label: string }[] = [
  { status: 'playing', label: t.library.tabs.playing },
  { status: 'backlog', label: t.library.tabs.backlog },
  { status: 'beaten', label: t.library.tabs.beaten },
  { status: 'shelved', label: t.library.tabs.shelved },
  { status: 'abandoned', label: t.library.tabs.abandoned },
];

type LibraryTabsProps = {
  value: UserGameStatus;
  onChange: (status: UserGameStatus) => void;
};

export function LibraryTabs({ value, onChange }: LibraryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 py-2"
    >
      {LIBRARY_TABS.map((tab) => (
        <Pressable
          key={tab.status}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === tab.status }}
          onPress={() => onChange(tab.status)}
          className={`h-10 justify-center rounded-full border px-4 ${
            value === tab.status ? 'border-accent bg-accent/20' : 'border-border bg-surface'
          }`}
        >
          <Text className={value === tab.status ? 'font-bold text-text' : 'text-muted'}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
