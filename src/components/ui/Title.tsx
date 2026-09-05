import { Text } from 'react-native';

type TitleProps = { children: string; className?: string };

export function Title({ children, className = '' }: TitleProps) {
  return (
    <Text className={`text-center text-2xl font-bold text-text ${className}`}>{children}</Text>
  );
}

export function Subtitle({ children, className = '' }: TitleProps) {
  return <Text className={`text-center text-base text-muted ${className}`}>{children}</Text>;
}
