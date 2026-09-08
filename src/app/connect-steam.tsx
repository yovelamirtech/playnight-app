import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Subtitle } from '@/components/ui/Title';
import { TextField } from '@/components/ui/TextField';
import { importSteamGames } from '@/db/repositories/steamImportRepo';
import { t } from '@/i18n';
import { getSteamGateway, SteamImportError } from '@/lib/steam';

type Status =
  | { kind: 'idle' }
  | { kind: 'resolving' }
  | { kind: 'importing'; done: number; total: number }
  | { kind: 'done'; imported: number; updated: number }
  | { kind: 'error'; message: string };

const isSteamId64 = (value: string): boolean => /^\d{17}$/.test(value.trim());

export default function ConnectSteamScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const isBusy = status.kind === 'resolving' || status.kind === 'importing';

  const submit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;

    setStatus({ kind: 'resolving' });
    try {
      const gateway = getSteamGateway();
      const steamId = isSteamId64(trimmed) ? trimmed : await gateway.resolveVanityUrl(trimmed);
      const ownedGames = await gateway.getOwnedGames(steamId);

      if (ownedGames.length === 0) {
        setStatus({ kind: 'error', message: t.connectSteam.emptyLibrary });
        return;
      }

      setStatus({ kind: 'importing', done: 0, total: ownedGames.length });
      const result = await importSteamGames(ownedGames, (done, total) =>
        setStatus({ kind: 'importing', done, total }),
      );
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
            onPress={() => router.replace('/library')}
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
