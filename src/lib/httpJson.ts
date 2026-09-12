/**
 * מכניקת ה-fetch+ok-check+parse המשותפת לכל שערי ה-HTTP (igdb/steam/hltb).
 * ניסוח הודעת השגיאה נשאר אצל כל שער בנפרד דרך onError — רק המנגנון
 * המכני עצמו משותף.
 *
 * `parseErrorBody` אופציונלי: כשהוא מוגדר, מנסים לפענח את גוף התשובה
 * (עם fallback אם הפענוח נכשל) ומעבירים אותו ל-onError; כשהוא לא מוגדר
 * (ברירת המחדל), onError מקבל body=undefined בלי לנסות לפענח כלל —
 * זו בדיוק ההתנהגות הקודמת של igdb's httpGateway.
 */
export async function fetchJson<T>(
  url: string,
  init: RequestInit | undefined,
  onError: (status: number, body: unknown) => never,
  parseErrorBody?: { fallback: unknown }
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = parseErrorBody
      ? await response.json().catch(() => parseErrorBody.fallback)
      : undefined;
    onError(response.status, body);
  }
  return (await response.json()) as T;
}
