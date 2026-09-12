import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Subtitle } from '@/components/ui/Title';
import { TextField } from '@/components/ui/TextField';
import { getConnectedPlatforms } from '@/db/repositories/gamesRepo';
import { getIsPro } from '@/db/repositories/proRepo';
import { importSteamGames } from '@/db/repositories/steamImportRepo';
import { t } from '@/i18n';
import { getAnalyticsGateway } from '@/lib/analytics';
import { canConnectPlatform } from '@/lib/entitlements/limits';
import { getSteamGateway, SteamImportError } from '@/lib/steam';

type Status =
  | { kind: 'idle' }
  | { kind: 'resolving' }
  | { kind: 'importing'; done: number; total: number }
  | { kind: 'done'; imported: number; updated: number }
  | { kind: 'error'; message: string };

const isSteamId64 = (value: string): boolean => /^\d{17}$/.test(value.trim());

/** תומך בהדבקת URL מלא (steamcommunity.com/id/NAME) ולא רק שם הפרופיל. */
const extractVanityName = (value: string): string => {
  const match = value.trim().match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  return match ? match[1] : value.trim();
};

export default function ConnectSteamScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const isBusy = status.kind === 'resolving' || status.kind === 'importing';

  const submit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;

    const [connectedPlatforms, isPro] = await Promise.all([getConnectedPlatforms(), getIsPro()]);
    if (!canConnectPlatform(connectedPlatforms, 'Steam', isPro)) {
      router.push({ pathname: '/paywall', params: { reason: 'platform' } });
      return;
    }

    setStatus({ kind: 'resolving' });
    try {
      const gateway = getSteamGateway();
      const steamId = isSteamId64(trimmed)
        ? trimmed
        : await gateway.resolveVanityUrl(extractVanityName(trimmed));
      const ownedGames = await gateway.getOwnedGames(steamId);

      if (ownedGames.length === 0) {
        setStatus({ kind: 'error', message: t.connectSteam.emptyLibrary });
        return;
      }

      setStatus({ kind: 'importing', done: 0, total: ownedGames.length });
      const result = await importSteamGames(ownedGames, (done, total) =>
        setStatus({ kind: 'importing', done, total }),
      );
      if (result.imported > 0) getAnalyticsGateway().capture('game_added', { method: 'steam' });
      setStatus({ kind: 'done', imported: result.imported, updated: result.updated });
    } catch (error) {
      const message =
        error instanceof SteamImportError || error instanceof Error
          ? error.message
          : String(error);
      setStatus({ kind: 'error', message });
    }
  };

  return (
    <Screen>
      <ScreenHeader title={t.connectSteam.title} />

      {status.kind === 'done' ? (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-center text-lg font-bold text-text">{t.connectSteam.doneTitle}</Text>
          <Subtitle>{t.connectSteam.doneBody(status.imported, status.updated)}</Subtitle>
          <PrimaryButton
            label={t.connectSteam.backToLibrary}
            onPress={() => {
              // מנקה גם /settings מה-stack (אם הגענו דרך resync) כדי ש"back"
              // מה-library יחזור ישר להום, לא להגדרות.
              router.dismissAll();
              router.push('/library');
            }}
          />
        </View>
      ) : (
        <View className="gap-5 pt-4">
          <TextField
            label={t.connectSteam.inputLabel}
            value={input}
            onChangeText={setInput}
            placeholder="76561197960287930"
            autoFocus
          />
          <Subtitle className="text-left">{t.connectSteam.inputHint}</Subtitle>

          {status.kind === 'resolving' ? (
            <Text className="text-center text-sm text-muted">{t.connectSteam.resolving}</Text>
          ) : null}
          {status.kind === 'importing' ? (
            <Text className="text-center text-sm text-muted">
              {t.connectSteam.importing(status.done, status.total)}
            </Text>
          ) : null}
          {status.kind === 'error' ? (
            <Text className="text-center text-sm text-warn">{status.message}</Text>
          ) : null}

          <PrimaryButton
            label={t.connectSteam.importCta}
            disabled={!input.trim() || isBusy}
            onPress={() => void submit()}
          />
        </View>
      )}
    </Screen>
  );
}
