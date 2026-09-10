import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { syncNow } from '@/db/repositories/syncRepo';
import { t } from '@/i18n';
import { formatTimeAgo } from '@/lib/timeAgo';
import { requestSignInCode, signOut, verifySignInCode } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { useAuthSession } from '@/lib/supabase/useAuthSession';
import { getLastSyncedAt } from '@/lib/sync/lastSyncedAt';

/**
 * §8 שלב 4 — סנכרון הוא תוסף אופציונלי לגמרי, לא onboarding חוסם: אם
 * `EXPO_PUBLIC_SUPABASE_URL` לא הוגדר, הסקשן הזה לא מוצג בכלל והאפליקציה
 * ממשיכה בדיוק כמו לפני שלב 4 (AGENTS.md כלל 4).
 */
export function SyncSection() {
  const { session, loading } = useAuthSession();

  if (!isSupabaseConfigured()) return null;
  if (loading) return null;

  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      <Text className="text-base font-semibold text-text">{t.sync.title}</Text>
      <Text className="text-xs text-muted">{t.sync.hint}</Text>
      {session ? <SignedInPanel email={session.user.email ?? ''} /> : <SignInPanel />}
    </View>
  );
}

function SignInPanel() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      await requestSignInCode(email);
      setCodeSent(true);
    } catch (cause) {
      setError(t.sync.requestCodeError(cause instanceof Error ? cause.message : String(cause)));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      await verifySignInCode(email, code);
    } catch (cause) {
      setError(t.sync.verifyCodeError(cause instanceof Error ? cause.message : String(cause)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-3">
      <TextField
        label={t.sync.emailLabel}
        value={email}
        onChangeText={setEmail}
        placeholder={t.sync.emailPlaceholder}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {codeSent && (
        <TextField
          label={t.sync.codeLabel}
          value={code}
          onChangeText={setCode}
          placeholder={t.sync.codePlaceholder}
          keyboardType="number-pad"
        />
      )}
      {error && <Text className="text-xs text-red-500">{error}</Text>}
      {busy ? (
        <ActivityIndicator />
      ) : (
        <PrimaryButton
          label={codeSent ? t.sync.verifyCode : t.sync.sendCode}
          onPress={codeSent ? verify : sendCode}
          disabled={email.trim().length === 0 || (codeSent && code.trim().length === 0)}
        />
      )}
      {codeSent && !busy && <PrimaryButton label={t.sync.resendCode} onPress={sendCode} />}
    </View>
  );
}

function SignedInPanel({ email }: { email: string }) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAtState] = useState<Date | null>(null);

  useEffect(() => {
    getLastSyncedAt().then(setLastSyncedAtState);
  }, []);

  const runSync = async () => {
    setSyncing(true);
    setStatus(null);
    const result = await syncNow();
    if (result.status === 'error') {
      setStatus(t.sync.syncError(result.message));
    } else if (result.status === 'success') {
      setLastSyncedAtState(await getLastSyncedAt());
    }
    setSyncing(false);
  };

  return (
    <View className="gap-3">
      <Text className="text-sm text-text">{t.sync.signedInAs(email)}</Text>
      <Text className="text-xs text-muted">
        {lastSyncedAt
          ? t.sync.lastSynced(
              formatTimeAgo(lastSyncedAt) === 'today' ? 'today' : `${formatTimeAgo(lastSyncedAt)} ago`
            )
          : t.sync.neverSynced}
      </Text>
      {status && <Text className="text-xs text-red-500">{status}</Text>}
      {syncing ? <ActivityIndicator /> : <PrimaryButton label={t.sync.syncNow} onPress={runSync} />}
      <PrimaryButton label={t.sync.signOut} onPress={() => void signOut()} />
    </View>
  );
}
