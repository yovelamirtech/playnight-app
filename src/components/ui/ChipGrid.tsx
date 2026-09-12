import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { View } from 'react-native';

type ChipGridProps<T> = {
  /** אפשרויות מחולקות מראש לשורות (למשל MOODS.slice(0, 3) / .slice(3)). */
  rows: T[][];
  keyFor: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
  /** מחלקת ה-gap בין השורות ובין הצ'יפים בכל שורה (ברירת מחדל תואמת ל-MoodPicker/TimePicker). */
  gapClassName?: string;
};

/** רשת צ'יפים משותפת: מפצלת אפשרויות לשורות ומציגה כל שורה כקבוצה אופקית (§3.2, §4.5). */
export function ChipGrid<T>({ rows, keyFor, renderItem, gapClassName = 'gap-3' }: ChipGridProps<T>) {
  return (
    <View className={gapClassName}>
      {rows.map((row, index) => (
        <View key={index} className={`flex-row ${gapClassName}`}>
          {row.map((item) => (
            <Fragment key={keyFor(item)}>{renderItem(item)}</Fragment>
          ))}
        </View>
      ))}
    </View>
  );
}
