import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { offersView, useBonuses, useOffers, useOptIn, useSetMarketing, wageringProgress, type Offer } from '../../bonuses/api/bonuses';

const day = (iso: string) => new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

function keyTerms(o: Offer): string[] {
  const money = (minor: number) => formatRand(minor, o.currency);
  const terms =
    o.kind === 'depositMatch'
      ? [`${o.matchPercent}% match up to ${money(o.maxAward)}`, `Min deposit ${money(o.minDeposit)}`, `Wager ${o.wageringMultiplier}x the bonus`]
      : [`Free bet of ${money(o.maxAward)} when your first bet settles`];
  return [...terms, `Min odds ${formatOdds(o.minOdds)}`, `Lasts ${o.validDays} days once given`, `${day(o.startsAt)} to ${day(o.endsAt)}`];
}

function OfferCard({ offer }: { offer: Offer }) {
  const [open, setOpen] = useState(false);
  const optIn = useOptIn();
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{offer.name}</Text>
      {keyTerms(offer).map((t) => (
        <Text key={t} style={styles.term}>
          {t}
        </Text>
      ))}
      <Pressable accessibilityRole="button" aria-expanded={open} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.link}>{open ? 'Hide terms' : 'Full terms'}</Text>
      </Pressable>
      {open ? <Text style={styles.terms}>{offer.terms}</Text> : null}
      {offer.awarded ? (
        <Text style={styles.done}>Claimed</Text>
      ) : offer.optInRequired ? (
        offer.optedIn ? (
          <View style={styles.row}>
            <Text style={styles.done}>Opted in</Text>
            <Pressable accessibilityRole="button" disabled={optIn.isPending} onPress={() => optIn.mutate({ promotionId: offer.promotionId, optIn: false })}>
              <Text style={styles.link}>Opt out</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" disabled={optIn.isPending} onPress={() => optIn.mutate({ promotionId: offer.promotionId, optIn: true })} style={styles.button}>
            <Text style={styles.buttonText}>Opt in</Text>
          </Pressable>
        )
      ) : (
        <Text style={styles.muted}>No opt in needed.</Text>
      )}
      {optIn.isError ? (
        <Text style={styles.error} accessibilityRole="alert">
          That did not save. Try again.
        </Text>
      ) : null}
    </View>
  );
}

/** The signed-in customer's bonus, free bets and live offers, with opt in and the switch for offers. */
export function MyOffers() {
  const bonuses = useBonuses();
  const offers = useOffers();
  const marketing = useSetMarketing();
  const b = bonuses.data;
  const view = offers.data ? offersView(offers.data) : null;

  return (
    <View style={styles.wrap}>
      {b?.bonus ? (
        <View style={styles.card}>
          <Text style={styles.kicker}>Your bonus</Text>
          <Text style={styles.name}>{b.bonus.promotionName}</Text>
          <Text style={styles.balance}>{formatRand(b.bonusBalance, b.currency)}</Text>
          <View style={styles.track} role="progressbar" aria-label="Wagering progress" aria-valuenow={Math.round(wageringProgress(b.bonus) * 100)}>
            <View style={[styles.fill, { width: `${wageringProgress(b.bonus) * 100}%` }]} />
          </View>
          <Text style={styles.term}>
            Wagered {formatRand(b.bonus.wagered, b.currency)} of {formatRand(b.bonus.wageringTarget, b.currency)}
          </Text>
          <Text style={styles.muted}>Ends {day(b.bonus.expiresAt)}</Text>
        </View>
      ) : null}
      {b?.freeBets.map((f) => (
        <View key={f.freeBetId} style={styles.card}>
          <Text style={styles.kicker}>Free bet</Text>
          <Text style={styles.name}>{formatRand(f.amount, f.currency)}</Text>
          <Text style={styles.term}>
            Min odds {formatOdds(f.minOdds)}. Ends {day(f.expiresAt)}. Use it in your betslip.
          </Text>
        </View>
      ))}

      {offers.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {view === 'restricted' ? <Text style={styles.note}>Offers are not available on your account right now.</Text> : null}
      {view === 'list' || view === 'optedOut' ? (
        <View style={[styles.card, styles.row]}>
          <Text style={styles.term}>Show me offers</Text>
          <Switch
            accessibilityLabel="Show me offers"
            value={view === 'list'}
            disabled={marketing.isPending}
            onValueChange={(on) => marketing.mutate(!on)}
            trackColor={{ true: colors.accent, false: colors.cardHigh }}
          />
        </View>
      ) : null}
      {view === 'optedOut' ? <Text style={styles.note}>Offers are off. Turn them on to see what is available.</Text> : null}
      {view === 'list' ? (
        <View style={styles.grid}>
          {offers.data!.offers.length === 0 ? <Text style={styles.note}>No offers right now.</Text> : null}
          {offers.data!.offers.map((o) => (
            <OfferCard key={o.promotionId} offer={o} />
          ))}
        </View>
      ) : null}
      {marketing.isError ? (
        <Text style={styles.error} accessibilityRole="alert">
          That did not save. Try again.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  grid: { gap: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  name: { color: colors.text, fontWeight: '800', fontSize: 17 },
  balance: { color: colors.positive, fontWeight: '800', fontSize: 22, fontVariant: ['tabular-nums'] },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.cardHigh, overflow: 'hidden', marginTop: spacing.xs },
  fill: { height: 8, backgroundColor: colors.positive },
  term: { color: colors.text, fontSize: 14 },
  terms: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  muted: { color: colors.textMuted, fontSize: 13 },
  note: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.accent, fontSize: 13, fontWeight: '700', paddingVertical: 4 },
  done: { color: colors.positive, fontWeight: '800' },
  button: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 16, marginTop: spacing.xs },
  buttonText: { color: '#ffffff', fontWeight: '800' },
  error: { color: colors.negative, fontSize: 13 },
});
