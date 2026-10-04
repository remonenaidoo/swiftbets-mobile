import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { formatRand, newIdempotencyKey } from '../../../shared/lib/format';
import { useSession } from '../../../shared/lib/useSession';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { buyErrorMessage, localNumber, spacedNumber, useAirtimeCatalogue, useAirtimeOrders, useBuyAirtime, type AirtimeOrder } from '../api/airtime';

const when = (iso: string) => new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const statusLabel: Record<AirtimeOrder['status'], string> = { pending: 'Pending', fulfilled: 'Sent', refunded: 'Refunded', failed: 'Failed' };

function outcome(order: AirtimeOrder): string {
  switch (order.status) {
    case 'fulfilled':
      return `Sent to ${spacedNumber(order.msisdn)}.`;
    case 'refunded':
      return `The network could not top up this number${order.reason ? ` (${order.reason})` : ''}. Your money is back in your balance.`;
    case 'pending':
      return 'Still with the network. We will finish it, and refund you if it fails.';
    default:
      return order.reason ?? 'The purchase did not go through.';
  }
}

/** Airtime and data for any SA network, paid from the wallet. */
export function AirtimeScreen() {
  const signedIn = useSession().data?.signedIn === true;
  const catalogue = useAirtimeCatalogue();
  const orders = useAirtimeOrders();
  const buy = useBuyAirtime();
  const [network, setNetwork] = useState('vodacom');
  const [kind, setKind] = useState<'airtime' | 'data'>('airtime');
  const [bundle, setBundle] = useState<string | null>(null);
  const [rand, setRand] = useState('');
  const [number, setNumber] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AirtimeOrder | null>(null);
  // One request id per confirmed purchase, kept for retries after a network error so it is never bought twice.
  const requestId = useRef<string | null>(null);

  const products = useMemo(() => (catalogue.data?.products ?? []).filter((p) => p.network === network && p.kind === kind), [catalogue.data, network, kind]);
  const product = kind === 'airtime' ? products[0] : products.find((p) => p.code === bundle);
  const amount = kind === 'airtime' ? Math.round(Number(rand.replace(',', '.')) * 100) : (product?.price ?? 0);
  const local = localNumber(number);

  if (!signedIn) {
    return <EmptyState title="Sign in to buy airtime" message="Buy airtime and data from your balance once you are signed in." />;
  }
  if (catalogue.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (catalogue.isError) {
    return <EmptyState title="Airtime could not load" message="Check your connection and try again." />;
  }

  const c = catalogue.data;
  const amountProblem =
    kind === 'airtime' && (!Number.isFinite(amount) || amount < c.minAirtime || amount > c.maxAirtime)
      ? `Enter an amount from ${formatRand(c.minAirtime)} to ${formatRand(c.maxAirtime)}.`
      : kind === 'data' && !product
        ? 'Choose a bundle.'
        : null;

  const review = () => {
    setError(null);
    setResult(null);
    if (amountProblem) {
      setError(amountProblem);
      return;
    }
    if (!local) {
      setError(buyErrorMessage('invalid_number', ''));
      return;
    }
    requestId.current = newIdempotencyKey();
    setConfirming(true);
  };

  const confirm = () => {
    if (!product || !local || !requestId.current) {
      return;
    }
    setError(null);
    buy.mutate(
      { clientRequestId: requestId.current, productCode: product.code, amount: kind === 'airtime' ? amount : undefined, msisdn: local },
      {
        onSuccess: (order) => {
          setResult(order);
          setConfirming(false);
          requestId.current = null;
        },
        onError: (e) => {
          // A refusal is final, so the next try is a new purchase; a lost connection keeps the id for a safe retry.
          if (e instanceof ApiError) {
            setError(buyErrorMessage(e.code, e.message));
            setConfirming(false);
            requestId.current = null;
          } else {
            setError('We could not reach SwiftBets. Try again: you will not be charged twice.');
          }
        },
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title} accessibilityRole="header">
        Airtime and data
      </Text>
      <Text style={styles.muted}>
        {formatRand(c.spentToday)} of {formatRand(c.dailyLimit)} used today
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Network</Text>
        <View style={styles.chips}>
          {c.networks.map((n) => (
            <Chip key={n.code} label={n.name} active={network === n.code} onPress={() => (setNetwork(n.code), setBundle(null), setConfirming(false))} />
          ))}
        </View>

        <View style={styles.chips}>
          <Chip label="Airtime" active={kind === 'airtime'} onPress={() => (setKind('airtime'), setConfirming(false))} />
          <Chip label="Data" active={kind === 'data'} onPress={() => (setKind('data'), setConfirming(false))} />
        </View>

        {kind === 'airtime' ? (
          <>
            <Text style={styles.label}>Amount (R)</Text>
            <TextInput
              value={rand}
              onChangeText={(v) => (setRand(v), setConfirming(false))}
              keyboardType="decimal-pad"
              placeholder={`${c.minAirtime / 100} to ${c.maxAirtime / 100}`}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Amount in rand"
              style={styles.input}
            />
          </>
        ) : (
          <View style={styles.bundles}>
            {products.map((p) => (
              <Pressable
                key={p.code}
                accessibilityRole="radio"
                accessibilityState={{ selected: bundle === p.code }}
                onPress={() => (setBundle(p.code), setConfirming(false))}
                style={[styles.bundle, bundle === p.code && styles.bundleActive]}
              >
                <Text style={styles.bundleName}>{p.name}</Text>
                <Text style={styles.bundlePrice}>{formatRand(p.price ?? 0)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.label}>Cellphone number</Text>
        <TextInput
          value={number}
          onChangeText={(v) => (setNumber(v), setConfirming(false))}
          keyboardType="phone-pad"
          placeholder="082 123 4567"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Cellphone number"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {confirming && local ? (
          <View style={styles.confirm}>
            <Text style={styles.text}>
              Buy {kind === 'airtime' ? 'airtime' : product?.name} for {formatRand(amount)} to {spacedNumber(local)}?
            </Text>
            <View style={styles.chips}>
              <Pressable accessibilityRole="button" onPress={confirm} disabled={buy.isPending} style={styles.primary}>
                <Text style={styles.primaryText}>{buy.isPending ? 'Buying...' : 'Confirm'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} style={styles.secondary}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={review} style={styles.primary}>
            <Text style={styles.primaryText}>Buy</Text>
          </Pressable>
        )}

        {result ? (
          <View style={[styles.result, result.status === 'fulfilled' ? styles.ok : styles.warn]}>
            <Text style={styles.text}>{outcome(result)}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.section}>Recent</Text>
      {orders.data?.length === 0 ? <Text style={styles.muted}>No airtime or data bought yet.</Text> : null}
      {orders.data?.map((o) => (
        <View key={o.orderId} style={styles.order}>
          <View style={styles.orderMain}>
            <Text style={styles.text}>
              {o.networkName} {o.product ?? ''} · {spacedNumber(o.msisdn)}
            </Text>
            <Text style={styles.muted}>
              {formatRand(o.amount)} · {when(o.createdAt)}
            </Text>
            {o.status === 'refunded' && o.reason ? <Text style={styles.muted}>{o.reason}</Text> : null}
          </View>
          <Text style={[styles.status, o.status === 'fulfilled' ? styles.ok : styles.warn]}>{statusLabel[o.status]}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40, maxWidth: 760, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  section: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  text: { color: colors.text, fontSize: 15 },
  muted: { color: colors.textMuted, fontSize: 13 },
  error: { color: colors.negative, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700' },
  chipTextActive: { color: '#ffffff' },
  input: { color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, fontSize: 16 },
  bundles: { gap: spacing.sm },
  bundle: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  bundleActive: { borderColor: colors.accent, borderWidth: 2 },
  bundleName: { color: colors.text, fontWeight: '700' },
  bundlePrice: { color: colors.odds, fontWeight: '800' },
  confirm: { gap: spacing.sm },
  primary: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.lg, alignItems: 'center' },
  primaryText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  secondary: { borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  secondaryText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  result: { borderRadius: radius.md, padding: spacing.sm, borderLeftWidth: 3 },
  ok: { borderLeftColor: colors.positive, color: colors.positive },
  warn: { borderLeftColor: colors.warning, color: colors.warning },
  order: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  orderMain: { flex: 1, gap: 2 },
  status: { fontWeight: '800', fontSize: 13 },
});
