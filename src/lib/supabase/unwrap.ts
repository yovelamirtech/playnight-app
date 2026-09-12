/**
 * מפרק תשובת Supabase בצורת {data, error} — זורק את השגיאה כמו שהיא אם
 * יש כזו, אחרת מחזיר את data. syncPushRepo/syncPullRepo חוזרים על
 * `if (error) throw error;` אחרי כל upsert/select — זה מרכז את זה.
 */
export async function unwrap<T>(promise: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
}
