import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  /** מסכי ההחלטה (§3.2/§3.3) מרוכזים במרכז; רשימות נשארות מלמעלה. */
  center?: boolean;
};

export function Screen({ children, center = false }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className={center ? 'flex-1 justify-center px-6' : 'flex-1 px-6'}>{children}</View>
    </SafeAreaView>
  );
}
