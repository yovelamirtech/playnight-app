import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Subtitle, Title } from '@/components/ui/Title';
import { t } from '@/i18n';
import { setIsPro } from '@/db/repositories/proRepo';
import { getRevenueCatGateway, isRevenueCatConfigured } from '@/lib/revenuecat';
import type { SubscriptionPackage } from '@/lib/revenuecat';

type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'error'; message: string };

/** למה נפתח מסך ה-paywall — קובע רק את שורת ההסבר, לא את שאר ההתנהגות (§5, §8 שלב 4). */
export type PaywallReason = 'firstSession' | 'library' | 'platform' | 'notes';

/** SPEC §5 — paywall, מוצג אחרי הסשן הראשון או כשמגבלת חינם נחצית (§8 שלב 4). */
export default function PaywallScreen() {
  const router = useRouter();
  const { reason, gameId } = useLocalSearchParams<{ reason?: PaywallReason; gameId?: string }>();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  useEffect(() => {
    let cancelled = false;
    const gateway = getRevenueCatGateway();
    gateway
      .configure()
      .then(() => gateway.getPackages())
      .then((next) => {
        if (!cancelled) setPackages(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // אם הגענו מ-session-log (§5, "אחרי הסשן הראשון"/הערה חסומה) — הסשן הפעיל
  // כבר נוקה שם, אז back() היה נוחת על session-confirm ריק (מסך שחור תקוע).
  // gameId מעביר אותנו במקום זאת בדיוק לאן שהזרימה הרגילה הייתה הולכת.
  const close = () =>
    gameId
      ? router.replace({ pathname: '/game/[id]', params: { id: gameId } })
      : router.canGoBack()
        ? router.back()
        : router.replace('/');

  const purchase = async (pkg: SubscriptionPackage) => {
    setStatus({ kind: 'busy' });
    try {
      const gateway = getRevenueCatGateway();
      const result = await gateway.purchase(pkg.identifier);
      await setIsPro(result.isPro);
      close();
    } catch (cause) {
      setStatus({
        kind: 'error',
        message: t.paywall.purchaseError(cause instanceof Error ? cause.message : String(cause)),
      });
    }
  };

  const restore = async () => {
    setStatus({ kind: 'busy' });
    try {
      const gateway = getRevenueCatGateway();
      const result = await gateway.restorePurchases();
      await setIsPro(result.isPro);
      setStatus(result.isPro ? { kind: 'idle' } : { kind: 'error', message: t.paywall.restoreSuccess });
      if (result.isPro) close();
    } catch (cause) {
      setStatus({
        kind: 'error',
        message: t.paywall.restoreError(cause instanceof Error ? cause.message : String(cause)),
      });
    }
  };

  const busy = status.kind === 'busy';

  const subtitle =
    reason === 'firstSession'
      ? t.paywall.afterFirstSessionBody
      : reason && reason in t.paywall.limitReached
        ? t.paywall.limitReached[reason as keyof typeof t.paywall.limitReached]
        : null;

  return (
    <Screen>
      <ScreenHeader title={t.paywall.title} />
      <ScrollView contentContainerClassName="gap-6 pb-8 pt-2">
        <Title>{reason === 'firstSession' ? t.paywall.afterFirstSessionTitle : t.paywall.title}</Title>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}

        <Card className="gap-3">
          <Text className="text-base font-bold text-text">{t.paywall.freeTitle}</Text>
          {t.paywall.freeFeatures.map((feature) => (
            <Text key={feature} className="text-sm text-muted">{`• ${feature}`}</Text>
          ))}
        </Card>

        <View className="gap-3 rounded-2xl border border-accent bg-accent/10 p-4">
          <Text className="text-base font-bold text-text">{t.paywall.proTitle}</Text>
          {t.paywall.proFeatures.map((feature) => (
            <Text key={feature} className="text-sm text-text">{`• ${feature}`}</Text>
          ))}
        </View>

        {!isRevenueCatConfigured() ? (
          <Subtitle>{t.paywall.notConfigured}</Subtitle>
        ) : (
          <View className="gap-3">
            {packages.map((pkg) => (
              <PrimaryButton
                key={pkg.identifier}
                label={t.paywall.purchaseCta(pkg.priceString)}
                onPress={() => void purchase(pkg)}
                disabled={busy}
              />
            ))}
          </View>
        )}

        {status.kind === 'error' ? (
          <Text className="text-center text-sm text-warn">{status.message}</Text>
        ) : null}

        {busy ? <ActivityIndicator /> : null}

        <PrimaryButton label={t.paywall.restorePurchases} onPress={() => void restore()} disabled={busy} />
        <PrimaryButton label={t.paywall.notNow} onPress={close} disabled={busy} />
      </ScrollView>
    </Screen>
  );
}
