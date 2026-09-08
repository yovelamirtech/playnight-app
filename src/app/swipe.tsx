import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import type { SwipeDirection } from '@/components/swipe/SwipeDeck';
import { SwipeDeck } from '@/components/swipe/SwipeDeck';
import { t } from '@/i18n';
import { dismissForWeek, getSwipeCandidates, hideForever } from '@/db/repositories/swipeRepo';
import type { SwipeCandidate } from '@/db/repositories/swipeRepo';
import { getRecommendations } from '@/lib/recommendation';
import type { RecommendationInput } from '@/lib/recommendation';
import { useActiveSessionStore } from '@/store/useActiveSessionStore';
import { useDecisionStore } from '@/store/useDecisionStore';

/** מוציאה עד 5 כרטיסים חדשים (§4.1) מתוך מה שעוד לא הוצג בערב הזה. */
function drawDeck(
  pool: SwipeCandidate[],
  input: RecommendationInput,
  shownIds: Set<string>
): SwipeCandidate[] {
  const remaining = pool.filter((candidate) => !shownIds.has(candidate.userGameId));
  // recommend.ts מחזיר את אותם אובייקטי candidate שהוזנו לו — הטיפוס
  // הבסיסי RecommendationCandidate נשאר טהור, וכאן משחזרים את שדות התצוגה.
  const picked = getRecommendations(remaining, input).map(
    (scored) => scored.candidate as SwipeCandidate
  );
  picked.forEach((candidate) => shownIds.add(candidate.userGameId));
  return picked;
}

export default function SwipeScreen() {
  const router = useRouter();
  const availableMinutes = useDecisionStore((state) => state.availableMinutes);
  const mood = useDecisionStore((state) => state.mood);
  const input: RecommendationInput = { availableMinutes, mood };

  const [pool, setPool] = useState<SwipeCandidate[] | null>(null);
  const [deck, setDeck] = useState<SwipeCandidate[]>([]);
  const [hasShownAny, setHasShownAny] = useState(false);
  const shownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    getSwipeCandidates().then((candidates) => {
      if (cancelled) return;
      setPool(candidates);
      const next = drawDeck(candidates, input, shownIds.current);
      setDeck(next);
      if (next.length > 0) setHasShownAny(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginSession = useActiveSessionStore((state) => state.begin);

  const goToDetails = (candidate: SwipeCandidate) => {
    router.push({ pathname: '/game/[id]', params: { id: candidate.userGameId } });
  };

  const goToConfirm = (candidate: SwipeCandidate) => {
    beginSession(candidate.userGameId);
    router.push('/session-confirm');
  };

  const handleSwipe = (candidate: SwipeCandidate, direction: SwipeDirection) => {
    setDeck((prev) => prev.filter((entry) => entry.userGameId !== candidate.userGameId));

    if (direction === 'left') void dismissForWeek(candidate.userGameId);
    else if (direction === 'up') void hideForever(candidate.userGameId);
    // right = "זה! בוא נשחק" (§3.3) → מסך האישור (§3.4).
    else goToConfirm(candidate);
  };

  const handleMoreOptions = () => {
    if (!pool) return;
    const next = drawDeck(pool, input, shownIds.current);
    setDeck(next);
    if (next.length > 0) setHasShownAny(true);
  };

  const handleChangeFilters = () => router.back();

  const isExhausted = pool !== null && deck.length === 0;
  const isFirstEmpty = isExhausted && !hasShownAny;

  return (
    <Screen>
      <ScreenHeader title={t.swipe.title} />

      {isExhausted ? (
        <View className="flex-1 items-center justify-center gap-4 px-4">
          <Text className="text-center text-lg font-bold text-text">
            {isFirstEmpty ? t.swipe.empty : t.swipe.exhaustedTitle}
          </Text>
          <PrimaryButton label={t.swipe.exhausted} onPress={handleMoreOptions} />
          <PrimaryButton label={t.swipe.changeFilters} onPress={handleChangeFilters} />
        </View>
      ) : (
        <View className="flex-1 gap-3 pb-4">
          <SwipeDeck candidates={deck} onSwipe={handleSwipe} onTap={goToDetails} />
          <Text className="text-center text-xs text-muted">{t.swipe.gestureHint}</Text>
          <Text className="text-center text-xs text-muted">{t.swipe.hideHint}</Text>
        </View>
      )}
    </Screen>
  );
}
