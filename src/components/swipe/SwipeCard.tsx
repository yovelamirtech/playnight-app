import { Image } from 'expo-image';
import { BarChart3, Gamepad2, Timer } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import { t } from '@/i18n';
import type { SwipeCandidate } from '@/db/repositories/swipeRepo';
import { formatTimeAgo } from '@/lib/timeAgo';

const MAX_GENRE_TAGS = 3;

type SwipeCardProps = {
  candidate: SwipeCandidate;
  now?: Date;
};

function dustLine(candidate: SwipeCandidate, now: Date): string | null {
  if (candidate.hoursPlayed === 0) {
    return t.swipe.untouchedLine(formatTimeAgo(candidate.addedAt, now));
  }
  if (candidate.lastPlayedAt) {
    return t.swipe.stoppedLine(formatTimeAgo(candidate.lastPlayedAt, now));
  }
  return null;
}

/** כרטיס בודד — תצוגה בלבד, בלי מחוות (§3.3). SwipeDeck אחראי על ה-gesture. */
export function SwipeCard({ candidate, now = new Date() }: SwipeCardProps) {
  const { sessionProfile } = candidate;
  const sessionLine = sessionProfile.interruptible
    ? t.swipe.sessionInterruptible(sessionProfile.typicalMinutes)
    : t.swipe.sessionLocked(sessionProfile.typicalMinutes);
  const dust = dustLine(candidate, now);

  return (
    <View className="h-full w-full overflow-hidden rounded-3xl border border-border bg-surface">
      <View className="h-3/5 w-full bg-surfaceAlt">
        {candidate.coverUrl ? (
          <Image
            source={{ uri: candidate.coverUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : null}
      </View>

      <View className="gap-2 p-4">
        <Text className="text-xl font-bold text-text" numberOfLines={2}>
          {candidate.name}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Timer size={16} color={palette.accentSoft} />
          <Text className="text-base font-bold text-accentSoft">{sessionLine}</Text>
        </View>

        {candidate.platform ? (
          <View className="flex-row items-center gap-1.5">
            <Gamepad2 size={14} color={palette.muted} />
            <Text className="text-sm text-muted">{candidate.platform}</Text>
          </View>
        ) : null}
        {dust ? (
          <View className="flex-row items-center gap-1.5">
            <BarChart3 size={14} color={palette.muted} />
            <Text className="text-sm text-muted">{dust}</Text>
          </View>
        ) : null}
        {candidate.communityRating != null ? (
          <Text className="text-sm text-muted">{t.swipe.rating(candidate.communityRating)}</Text>
        ) : null}

        {candidate.genres.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 pt-1">
            {candidate.genres.slice(0, MAX_GENRE_TAGS).map((genre) => (
              <View key={genre} className="rounded-full bg-surfaceAlt px-3 py-1">
                <Text className="text-xs text-muted">{genre}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
