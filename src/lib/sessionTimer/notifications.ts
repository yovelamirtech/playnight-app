import * as Notifications from 'expo-notifications';

import { t } from '@/i18n';

/**
 * §3.4 — "התראה עדינה בסוף הטיימר". עוטף את expo-notifications כך שכל
 * הקוד שקורא אליה לא צריך לדעת על הרשאות/שגיאות פלטפורמה — כשל כאן
 * אף פעם לא צריך להפיל את מסך האישור (הוא עדיין עובד עם ה-countdown
 * הטקסטואלי הקיים כ-fallback).
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function hasPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleSessionEndNotification(
  gameName: string,
  fireAt: Date
): Promise<string | null> {
  try {
    if (!(await hasPermission())) return null;
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: t.sessionConfirm.notificationTitle,
        body: t.sessionConfirm.notificationBody(gameName),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelSessionEndNotification(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // אין מה לעשות אם הביטול נכשל — ההתראה תישלח פעם אחת ותיעלם.
  }
}
