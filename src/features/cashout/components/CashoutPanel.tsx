import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { formatRand } from '../../../shared/lib/format';
import type { CashoutOffer, MyCoupon } from '../../../shared/lib/types';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { secondsLeft, useCashoutExecute, useCashoutQuote } from '../api/cashout';

const refusals: Record<string, string> = {
  coupon_settled: 'This bet has already settled.',
  coupon_cashed_out: 'This bet has already been cashed out.',
  not_single_line: 'Cashout is available on singles and accumulators.',
  no_open_legs: 'Nothing left to cash out on this bet.',
  leg_lost: 'A leg has lost, so there is nothing to cash out.',
  price_unavailable: 'A market is suspended right now. Try again in a moment.',
};

/** Only singles and accumulators cash out (system bets are refused by the service too). */
export function canCashOut(coupon: MyCoupon): boolean {
  return coupon.status === 'open' && (coupon.betType === 'single' || coupon.betType === 'accumulator');
}

/** Ask for a quote, show it with its countdown, confirm; a moved price comes back as a new offer to confirm. */
export function CashoutPanel({ coupon }: { coupon: MyCoupon }) {
  const quote = useCashoutQuote();
  const execute = useCashoutExecute();
  const [offer, setOffer] = useState<CashoutOffer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [paid, setPaid] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!offer) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [offer]);

  const left = offer ? secondsLeft(offer, now) : 0;
  const error = quote.error ?? execute.error;
  const message = error instanceof ApiError ? (refusals[error.code] ?? error.message) : error ? 'Cashout is unavailable right now.' : null;

  const ask = () => {
    setNotice(null);
    quote.mutate(coupon.couponId, { onSuccess: (o) => (setOffer(o), setNow(Date.now())) });
  };
  const confirm = (o: CashoutOffer) =>
    execute.mutate(o, {
      onSuccess: (outcome) => {
        if (outcome.kind === 'paid') {
          setPaid(outcome.amount);
          setOffer(null);
        } else {
          setOffer(outcome.offer);
          setNow(Date.now());
          setNotice(outcome.reason === 'quote_expired' ? 'That offer expired. Here is a fresh one.' : 'The price moved. Here is the new offer.');
        }
      },
    });

  if (paid !== null) {
    return (
      <Text style={styles.paid} accessibilityLiveRegion="polite">
        Cashed out {formatRand(paid, coupon.currency)}
      </Text>
    );
  }

  const busy = quote.isPending || execute.isPending;
  return (
    <View style={styles.panel}>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {message ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
      {offer && left > 0 ? (
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => confirm(offer)} style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}>
          {busy ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Cash out {formatRand(offer.amount, offer.currency)} · {left}s</Text>}
        </Pressable>
      ) : (
        <Pressable accessibilityRole="button" disabled={busy} onPress={ask} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>{offer ? 'Get a new cashout offer' : 'Cash out'}</Text>}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.xs, marginTop: spacing.xs },
  button: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, paddingVertical: 10, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  confirm: { backgroundColor: colors.accentStrong, borderColor: colors.accentStrong },
  pressed: { opacity: 0.8 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontVariant: ['tabular-nums'] },
  notice: { color: colors.warning, fontSize: 13 },
  error: { color: colors.negative, fontSize: 13 },
  paid: { color: colors.positive, fontWeight: '700', marginTop: spacing.xs },
});
