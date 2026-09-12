import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * `<BannerAd>` הוא native view אמיתי — ב-Expo Go (בלי Dev Build, ראה
 * AGENTS.md §2) הוא עלול לא להיות רשום בכלל וזה זורק בזמן render, לא
 * בזמן קריאה ל-API שאפשר לעטוף ב-try/catch רגיל. פרסומת היא שיפור, לא
 * תלות (בדיוק כמו notifications/hltb) — נכשל בשקט, לא מפיל את מסך הספרייה.
 */
export class AdErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
