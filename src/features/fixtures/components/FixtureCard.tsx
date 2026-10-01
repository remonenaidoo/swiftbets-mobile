import { useAtom } from 'jotai';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatKickoff, formatOdds } from '../../../shared/lib/format';
import type { Fixture } from '../../../shared/lib/types';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { slipAtom, toggleSelection } from '../../betslip/state/betslip';
import { marketLabel } from './marketLabel';

export const FixtureCard = memo(function FixtureCard({ fixture, now }: { fixture: Fixture; now: number }) {
  const [slip, setSlip] = useAtom(slipAtom);
  const fixtureName = `${fixture.homeTeam} v ${fixture.awayTeam}`;

  return (
    <View style={styles.card} accessibilityRole="summary" accessibilityLabel={fixtureName}>
      <View style={styles.header}>
        <Text style={styles.teams} numberOfLines={1}>
          {fixture.homeTeam} <Text style={styles.vs}>v</Text> {fixture.awayTeam}
        </Text>
        <Text style={styles.kickoff}>{formatKickoff(fixture.kickoffAt, now)}</Text>
      </View>
      <Text style={styles.competition}>{fixture.competition}</Text>
      {fixture.markets.map((market) => {
        const open = market.status === 'open' && fixture.status === 'scheduled';
        return (
          <View key={market.marketId} style={styles.market}>
            <Text style={styles.marketName}>{marketLabel(market.type)}</Text>
            <View style={styles.selections}>
              {market.selections.map((selection) => {
                const picked = slip.some((s) => s.marketId === market.marketId && s.selectionId === selection.selectionId);
                return (
                  <Pressable
                    key={selection.selectionId}
                    disabled={!open}
                    accessibilityRole="button"
                    accessibilityState={{ selected: picked, disabled: !open }}
                    accessibilityLabel={`${selection.name} at ${formatOdds(selection.odds)}`}
                    onPress={() =>
                      setSlip((current) =>
                        toggleSelection(current, {
                          fixtureId: fixture.fixtureId,
                          fixtureName,
                          marketId: market.marketId,
                          marketName: marketLabel(market.type),
                          selectionId: selection.selectionId,
                          selectionName: selection.name,
                          odds: selection.odds,
                          offerVersion: fixture.offerVersion,
                        }),
                      )
                    }
                    style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                      styles.price,
                      picked && styles.pricePicked,
                      (pressed || hovered) && open && !picked && styles.priceHover,
                      !open && styles.priceClosed,
                    ]}
                  >
                    <Text style={styles.selectionName} numberOfLines={1}>
                      {selection.name}
                    </Text>
                    <Text style={[styles.odds, picked && styles.oddsPicked]}>{open ? formatOdds(selection.odds) : 'Closed'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  teams: { color: colors.text, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  vs: { color: colors.textMuted, fontWeight: '400' },
  kickoff: { color: colors.textMuted, fontSize: 13, fontVariant: ['tabular-nums'] },
  competition: { color: colors.textMuted, fontSize: 12, marginTop: -4 },
  market: { gap: spacing.xs, marginTop: spacing.xs },
  marketName: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  selections: { flexDirection: 'row', gap: spacing.sm },
  price: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceHover: { borderColor: colors.accent },
  pricePicked: { backgroundColor: colors.selected, borderColor: colors.accent },
  priceClosed: { opacity: 0.45 },
  selectionName: { color: colors.textMuted, fontSize: 12 },
  odds: { color: colors.text, fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  oddsPicked: { color: '#ffffff' },
});
