import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { formatOdds } from '../../../shared/lib/format';
import type { Fixture } from '../../../shared/lib/types';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { toastAtom } from '../../../shared/ui/Toast';
import { slipAtom, toggleSelection } from '../../betslip/state/betslip';
import { marketLabel } from '../../fixtures/components/marketLabel';
import { useBuilderPrice } from '../api/betBuilder';
import { togglePick, type BuilderPick } from '../model';

const refusals: Record<string, string> = {
  bet_builder_contradiction: 'Those picks cannot all win together.',
  bet_builder_unavailable: 'Bet builder is not available on this match.',
  market_suspended: 'One of these markets is closed right now.',
};

/** Pick one selection per market; the combined price comes from the server and follows every offer change. */
export function BetBuilderPanel({ fixture }: { fixture: Fixture }) {
  const [picks, setPicks] = useState<BuilderPick[]>([]);
  const setSlip = useSetAtom(slipAtom);
  const toast = useSetAtom(toastAtom);
  const price = useBuilderPrice(fixture.fixtureId, picks, fixture.offerVersion);
  const open = fixture.status === 'scheduled';
  const error = price.error instanceof ApiError ? (refusals[price.error.code] ?? price.error.message) : price.error ? 'Could not price these picks. Try again.' : null;
  const quoted = picks.length >= 2 && !error ? price.data : undefined;

  const add = () => {
    if (!quoted) return;
    setSlip((slip) =>
      toggleSelection(slip, {
        fixtureId: fixture.fixtureId,
        fixtureName: `${fixture.homeTeam} v ${fixture.awayTeam}`,
        marketId: quoted.marketId,
        marketName: 'Bet builder',
        selectionId: quoted.selectionId,
        selectionName: picks.map((p) => p.name).join(', '),
        odds: quoted.odds,
        offerVersion: quoted.offerVersion,
        builder: { selections: picks },
      }),
    );
    toast('Bet builder added to your slip');
    setPicks([]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>Pick one outcome from each market and combine them into one bet.</Text>
      {fixture.markets.map((market) => {
        const marketOpen = open && market.status === 'open';
        return (
          <View key={market.marketId} style={styles.market}>
            <Text style={styles.marketName}>{marketLabel(market.type)}</Text>
            <View style={styles.row}>
              {market.selections.map((selection) => {
                const picked = picks.some((p) => p.marketId === market.marketId && p.selectionId === selection.selectionId);
                return (
                  <Pressable
                    key={selection.selectionId}
                    disabled={!marketOpen}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: picked, disabled: !marketOpen }}
                    accessibilityLabel={`Bet builder ${selection.name}`}
                    onPress={() => setPicks((current) => togglePick(current, { marketId: market.marketId, selectionId: selection.selectionId, name: selection.name }))}
                    style={[styles.pick, picked && styles.picked, !marketOpen && styles.closed]}
                  >
                    <Text style={[styles.pickText, picked && styles.pickedText]} numberOfLines={1}>
                      {selection.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
      <View style={styles.footer}>
        <View style={styles.grow}>
          <Text style={styles.muted}>{picks.length < 2 ? 'Pick at least two outcomes' : `${picks.length} picks`}</Text>
          {error ? (
            <Text role="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
        </View>
        <Text style={styles.price} accessibilityLabel={quoted ? `Combined price ${formatOdds(quoted.odds)}` : 'No price yet'}>
          {quoted ? formatOdds(quoted.odds) : '–'}
        </Text>
        <Pressable accessibilityRole="button" disabled={!quoted || price.isFetching} onPress={add} style={[styles.add, (!quoted || price.isFetching) && styles.closed]}>
          <Text style={styles.addText}>Add to slip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  hint: { color: colors.textMuted, fontSize: 13 },
  market: { backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, padding: spacing.md - 2, gap: spacing.sm + 2 },
  marketName: { color: colors.text, fontWeight: '800', fontSize: 15 },
  row: { flexDirection: 'row', gap: spacing.sm },
  pick: { flex: 1, minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  picked: { backgroundColor: colors.accent, borderColor: colors.accent },
  closed: { opacity: 0.5 },
  pickText: { color: colors.text, fontWeight: '700' },
  pickedText: { color: '#ffffff' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md - 2 },
  grow: { flex: 1, gap: 2 },
  muted: { color: colors.textMuted, fontSize: 13 },
  error: { color: colors.live, fontSize: 13 },
  price: { color: colors.odds, fontWeight: '900', fontSize: 20, fontVariant: ['tabular-nums'] },
  add: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 44, justifyContent: 'center' },
  addText: { color: '#ffffff', fontWeight: '800' },
});
