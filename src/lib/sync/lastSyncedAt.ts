import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'playnight.lastSyncedAt';

/** רק לתצוגה ("סונכרן לאחרונה...") — לא חלק מלוגיקת ה-LWW עצמה. */
export async function getLastSyncedAt(): Promise<Date | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? new Date(stored) : null;
}

export async function setLastSyncedAt(date: Date): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, date.toISOString());
}
