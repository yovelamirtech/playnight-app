import type { Session } from '@supabase/supabase-js';

import { getSupabaseClient } from './client';

/**
 * §8 שלב 4 — auth הוא magic code באימייל (OTP), לא סיסמה: §2 (AGENTS.md)
 * אומר שהמשתמש עובד בעיקר מהטלפון בלי טרמינל, אז "תקבל קוד באימייל
 * ותקליד אותו" הוא הזרימה הכי פשוטה שם. זה גם לא חוסם שום דבר קיים —
 * ה-auth הזה אופציונלי לגמרי, רק ל"סנכרון בין מכשירים" בהגדרות (§6 SPEC).
 */
export async function requestSignInCode(email: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  const { error } = await client.auth.signInWithOtp({ email: email.trim() });
  if (error) throw error;
}

export async function verifySignInCode(email: string, code: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  const { error } = await client.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

export async function getCurrentSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
