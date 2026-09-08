import { useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { SwipeCandidate } from '@/db/repositories/swipeRepo';

import { SwipeCard } from './SwipeCard';

const VISIBLE_CARDS = 3;
const SWIPE_OUT_MS = 220;
const TAP_MAX_DISTANCE = 8;

export type SwipeDirection = 'left' | 'right' | 'up';

type SwipeDeckProps = {
  candidates: SwipeCandidate[];
  onSwipe: (candidate: SwipeCandidate, direction: SwipeDirection) => void;
  onTap: (candidate: SwipeCandidate) => void;
};

/**
 * §3.3 — הכרטיס העליון בלבד מקבל gesture. Reanimated shared values +
 * runOnJS (לא Animated הישן) כדי שהתנועה תרגיש מיידית (§3.3 "באג נפוץ").
 */
function TopCard({
  candidate,
  onSwipe,
  onTap,
}: {
  candidate: SwipeCandidate;
  onSwipe: (direction: SwipeDirection) => void;
  onTap: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rightThreshold = width * 0.3;
  const upThreshold = height * 0.15;

  const finishSwipe = (direction: SwipeDirection) => {
    onSwipe(direction);
  };

  const pan = Gesture.Pan()
    .minDistance(TAP_MAX_DISTANCE)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const wentUp = event.translationY < -upThreshold && Math.abs(event.translationX) < width * 0.2;
      const wentRight = event.translationX > rightThreshold;
      const wentLeft = event.translationX < -rightThreshold;

      if (wentUp) {
        translateY.value = withTiming(-height, { duration: SWIPE_OUT_MS });
        runOnJS(finishSwipe)('up');
      } else if (wentRight) {
        translateX.value = withTiming(width * 1.5, { duration: SWIPE_OUT_MS });
        runOnJS(finishSwipe)('right');
      } else if (wentLeft) {
        translateX.value = withTiming(-width * 1.5, { duration: SWIPE_OUT_MS });
        runOnJS(finishSwipe)('left');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const tap = Gesture.Tap()
    .maxDistance(TAP_MAX_DISTANCE)
    .onEnd(() => runOnJS(onTap)());

  const gesture = Gesture.Race(pan, tap);

  const style = useAnimatedStyle(() => {
    const rotate = `${(translateX.value / width) * 20}deg`;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View className="absolute h-full w-full" style={style}>
        <SwipeCard candidate={candidate} />
      </Animated.View>
    </GestureDetector>
  );
}

export function SwipeDeck({ candidates, onSwipe, onTap }: SwipeDeckProps) {
  const stack = candidates.slice(0, VISIBLE_CARDS);

  return (
    <View className="flex-1">
      {stack
        .map((candidate, index) => ({ candidate, index }))
        .reverse()
        .map(({ candidate, index }) =>
          index === 0 ? (
            <TopCard
              key={candidate.userGameId}
              candidate={candidate}
              onSwipe={(direction) => onSwipe(candidate, direction)}
              onTap={() => onTap(candidate)}
            />
          ) : (
            <View
              key={candidate.userGameId}
              className="absolute h-full w-full"
              style={{
                transform: [{ scale: 1 - index * 0.04 }, { translateY: index * 10 }],
                opacity: 1 - index * 0.25,
              }}
            >
              <SwipeCard candidate={candidate} />
            </View>
          )
        )}
    </View>
  );
}
