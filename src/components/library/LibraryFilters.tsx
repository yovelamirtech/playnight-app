import { Pressable, ScrollView, Text, View } from 'react-native';

import { selectedPillClassName } from '@/components/ui/selectedPill';
import { t } from '@/i18n';
import type { LibraryFilters as Filters, SortOption } from '@/lib/library/filterSort';
import { SORT_OPTIONS } from '@/lib/library/filterSort';

type ChipRowProps<TValue extends string | number> = {
  allLabel: string;
  value: TValue | null;
  options: TValue[];
  labelFor: (value: TValue) => string;
  onChange: (value: TValue | null) => void;
};

function ChipRow<TValue extends string | number>({
  allLabel,
  value,
  options,
  labelFor,
  onChange,
}: ChipRowProps<TValue>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5">
      <Pressable
        onPress={() => onChange(null)}
        accessibilityRole="button"
        className={`h-7 justify-center rounded-full border px-2.5 ${selectedPillClassName(value === null)}`}
      >
        <Text className={value === null ? 'text-xs font-bold text-text' : 'text-xs text-muted'}>
          {allLabel}
        </Text>
      </Pressable>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          accessibilityRole="button"
          className={`h-7 justify-center rounded-full border px-2.5 ${selectedPillClassName(value === option)}`}
        >
          <Text className={value === option ? 'text-xs font-bold text-text' : 'text-xs text-muted'}>
            {labelFor(option)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

type LibraryFiltersProps = {
  platforms: string[];
  genres: string[];
  years: number[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
};

const SORT_LABELS: Record<SortOption, string> = {
  recent: t.library.sort.recent,
  rating: t.library.sort.rating,
  alphabetical: t.library.sort.alphabetical,
  dust: t.library.sort.dust,
  completionTime: t.library.sort.completionTime,
};

export function LibraryFilters({
  platforms,
  genres,
  years,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: LibraryFiltersProps) {
  return (
    <View className="gap-1 pb-1">
      <ChipRow
        allLabel={t.library.filters.allPlatforms}
        value={filters.platform}
        options={platforms}
        labelFor={(value) => value}
        onChange={(platform) => onFiltersChange({ ...filters, platform })}
      />
      <ChipRow
        allLabel={t.library.filters.allGenres}
        value={filters.genre}
        options={genres}
        labelFor={(value) => value}
        onChange={(genre) => onFiltersChange({ ...filters, genre })}
      />
      <ChipRow
        allLabel={t.library.filters.allYears}
        value={filters.year}
        options={years}
        labelFor={(value) => String(value)}
        onChange={(year) => onFiltersChange({ ...filters, year })}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="items-center gap-1.5"
      >
        <Text className="text-xs text-muted">{t.library.sort.label}:</Text>
        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() => onSortChange(option)}
            accessibilityRole="button"
            className={`h-7 justify-center rounded-full border px-2.5 ${selectedPillClassName(sort === option)}`}
          >
            <Text className={sort === option ? 'text-xs font-bold text-text' : 'text-xs text-muted'}>
              {SORT_LABELS[option]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
