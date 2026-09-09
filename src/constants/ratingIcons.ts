import { Heart, Meh, Moon, Smile } from 'lucide-react-native';

import type { SessionRating } from '@/db/schema';

/** אייקון לכל דירוג סשן (§3.5) — מחליף את אימוג'י הדירוג הישן. */
export const RATING_ICONS: Record<SessionRating, typeof Heart> = {
  loved: Heart,
  liked: Smile,
  meh: Meh,
  bored: Moon,
};
