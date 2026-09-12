import type { ReactNode } from 'react';
import { View } from 'react-native';

type CardProps = {
  children: ReactNode;
  className?: string;
};

/** מיכל כרטיס משותף — הבסיס החוזר rounded-2xl/border/bg-surface/p-4 בלי לשכפל אותו בכל מסך. */
export function Card({ children, className }: CardProps) {
  return (
    <View className={`rounded-2xl border border-border bg-surface p-4 ${className ?? ''}`}>
      {children}
    </View>
  );
}
