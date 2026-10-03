import { Link } from 'expo-router';
import { useAtom } from 'jotai';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatKickoff, formatOdds } from '../../../shared/lib/format';
import type { Fixture, Market } from '../../../shared/lib/types';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { Icon } from '../../../shared/ui/Icon';
import { slipAtom, toggleSelection } from '../../betslip/state/betslip';
import { fixtureName as nameOf, isOutright, sportOf } from '../../sports/sports';
import { marketLabel } from './marketLabel';

/** A team's initials on a colour derived from its name, standing in for a crest. */
export function Crest({ name, size = 20 }: { name: string; size?: number }) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return (
    <View style={[styles.crest, { width: size, height: size, borderRadius: size / 2, backgroundColor: `hsl(${hash}, 55%, 42%)` }]} aria-hidden>
      <Text style={[styles.crestText, { fontSize: size * 0.5 }]}>{name.slice(0, 1)}</Text>
    </View>
  );
}

/** Two or three prices sit in one row; a market with many selections (top batter, outright winner) wraps as a grid. */
export function OddsRow({ fixture, market, limit }: { fixture: Fixture; market: Market; limit?: number }) {
  const [slip, setSlip] = useAtom(slipAtom);
  const fixtureName = nameOf(fixture);
  const open = market.status === 'open' && fixture.status === 'scheduled';
  const grid = market.selections.length > 3;
  return (
    <View style={[styles.odds, grid && styles.oddsGrid]}>
      {market.selections.slice(0, limit).map((selection) => {
        const picked = slip.some((s) => s.marketId === market.marketId && s.selectionId === selection.selectionId);
        return (
          <Pressable
            key={selection.selectionId}
            disabled={!open}
            accessibilityRole="button"
            accessibilityState={{ selected: picked, disabled: !open }}
            accessibilityLabel={`${selection.name} ${open ? formatOdds(selection.odds) : '–'}`}
            onPress={() =>
              setSlip((current) =>
                toggleSelection(current, {
                  fixtureId: fixture.fixtureId,
                  fixtureName,
                  marketId: market.marketId,
                  marketName: marketLabel(market, sportOf(fixture)),
                  selectionId: selection.selectionId,
                  selectionName: selection.name,
                  odds: selection.odds,
                  offerVersion: fixture.offerVersion,
                }),
              )
            }
            style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.price, grid && styles.priceGrid, hovered && open && !picked && styles.priceHover, picked && styles.pricePicked, !open && styles.priceClosed]}
          >
            <Text style={[styles.priceName, picked && styles.pickedText]} numberOfLines={1}>
              {selection.name}
            </Text>
            <Text style={[styles.priceOdds, picked && styles.pickedOdds]}>{open ? formatOdds(selection.odds) : '–'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A match: kickoff or live, the two teams and its markets. An outright shows the competition and its leading runners. */
export const FixtureCard = memo(function FixtureCard({ fixture, now, showCompetition = true }: { fixture: Fixture; now: number; showCompetition?: boolean }) {
  const live = fixture.status === 'inPlay';
  const href = `/fixtures/${encodeURIComponent(fixture.fixtureId)}`;
  const [main, ...rest] = fixture.markets;
  const name = nameOf(fixture);
  const outright = isOutright(fixture);
  const sport = sportOf(fixture);

  return (
    <View style={styles.card} accessibilityRole="summary" accessibilityLabel={name}>
      <View style={styles.meta}>
        {live ? (
          <Text style={styles.live}>LIVE</Text>
        ) : (
          <Text style={styles.time}>{outright ? `Closes ${formatKickoff(fixture.kickoffAt, now)}` : formatKickoff(fixture.kickoffAt, now)}</Text>
        )}
        {showCompetition ? (
          <Text style={styles.time} numberOfLines={1}>
            · {fixture.competition}
          </Text>
        ) : null}
        <View style={styles.grow} />
        <Link href={href as never} style={styles.more} accessibilityLabel={`${name}, all markets`}>
          {outright ? 'All runners ›' : 'All markets ›'}
        </Link>
      </View>
      <Link href={href as never} asChild>
        <Pressable accessibilityRole="link" style={styles.teams}>
          {outright ? (
            <View style={styles.team}>
              <Icon name="sports/trophy" size={22} />
              <Text style={styles.teamName} numberOfLines={2}>
                {fixture.homeTeam}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.team}>
                <Crest name={fixture.homeTeam} />
                <Text style={styles.teamName} numberOfLines={1}>
                  {fixture.homeTeam}
                </Text>
              </View>
              <View style={styles.team}>
                <Crest name={fixture.awayTeam} />
                <Text style={styles.teamName} numberOfLines={1}>
                  {fixture.awayTeam}
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </Link>
      {main ? <OddsRow fixture={fixture} market={main} limit={outright ? 6 : undefined} /> : null}
      {rest.map((market) => (
        <View key={market.marketId}>
          <Text style={styles.marketName}>{marketLabel(market, sport)}</Text>
          <OddsRow fixture={fixture} market={market} />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md - 2, gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  grow: { flex: 1 },
  time: { color: colors.textMuted, fontSize: 12, fontVariant: ['tabular-nums'], flexShrink: 1 },
  live: { backgroundColor: colors.live, color: '#ffffff', fontWeight: '900', fontSize: 11, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  more: { color: colors.text, fontSize: 12, fontWeight: '700' },
  teams: { gap: 6 },
  team: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  teamName: { color: colors.text, fontSize: 15, fontWeight: '700', flexShrink: 1 },
  crest: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  crestText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  marketName: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.xs },
  odds: { flexDirection: 'row', gap: spacing.sm },
  oddsGrid: { flexWrap: 'wrap' },
  price: { flex: 1, minHeight: 50, borderRadius: radius.md - 2, backgroundColor: colors.surface, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm + 2, justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  priceGrid: { flexGrow: 1, flexShrink: 0, flexBasis: 130 },
  priceHover: { borderColor: colors.accent },
  pricePicked: { backgroundColor: colors.accent },
  priceClosed: { opacity: 0.4 },
  priceName: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  priceOdds: { color: colors.odds, fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'], marginTop: 1 },
  pickedText: { color: '#dbe6ff' },
  pickedOdds: { color: '#ffffff' },
});
