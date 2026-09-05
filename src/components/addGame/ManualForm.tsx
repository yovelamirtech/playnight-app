import { useState } from 'react';
import { Text, View } from 'react-native';

import { PlatformPicker } from '@/components/addGame/PlatformPicker';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import type { PlatformName } from '@/constants/session';
import { t } from '@/i18n';

type ManualFormProps = {
  onSubmit: (input: { name: string; platform: string | null; releaseYear: number | null }) => void;
};

export function ManualForm({ onSubmit }: ManualFormProps) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [platform, setPlatform] = useState<PlatformName | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) {
      setError(t.addGame.nameRequired);
      return;
    }
    setError(null);
    const parsedYear = Number.parseInt(year, 10);
    onSubmit({
      name,
      platform,
      releaseYear: Number.isFinite(parsedYear) ? parsedYear : null,
    });
    setName('');
    setYear('');
    setPlatform(null);
  };

  return (
    <View className="gap-5 pt-4">
      <TextField
        label={t.addGame.nameLabel}
        value={name}
        onChangeText={setName}
        placeholder={t.addGame.nameLabel}
      />
      <View className="gap-2">
        <Text className="text-sm text-muted">{t.addGame.platformLabel}</Text>
        <PlatformPicker value={platform} onChange={setPlatform} />
      </View>
      <TextField
        label={t.addGame.yearLabel}
        value={year}
        onChangeText={setYear}
        keyboardType="number-pad"
        placeholder="2020"
      />
      {error ? <Text className="text-sm text-warn">{error}</Text> : null}
      <PrimaryButton label={t.addGame.save} onPress={submit} />
    </View>
  );
}
