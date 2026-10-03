import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import type { Fixture, Market } from '../../../shared/lib/types';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { slipAtom, toggleSelection } from '../../betslip/state/betslip';
import { useFixtures } from '../../fixtures/api/fixtures';
import { Crest } from '../../fixtures/components/FixtureCard';
import { marketLabel } from '../../fixtures/components/marketLabel';
import { OddsFormatPicker } from '../../preferences/components/OddsFormatPicker';
import { useFormatOdds } from '../../preferences/oddsFormat';
import { todaysCoupon } from '../today';

const columns = [
  { type: 'matchResult', labels: ['1', 'X', '2'] },
  { type: 'totalGoalsOverUnder25', labels: ['O 2.5', 'U 2.5'] },
];

function Price({ fixture, market, index, width }: { fixture: Fixture; market: Market | undefined; index: number; width: number }) {
  const [slip, setSlip] = useAtom(slipAtom);
  const formatOdds = useFormatOdds();
  const selection = market?.selections[index];
  const open = !!market && !!selection && market.status === 'open' && fixture.status === 'scheduled';
  const picked = !!selection && slip.some((s) => s.marketId === market?.marketId && s.selectionId === selection.selectionId);
  return (
    <Pressable
      disabled={!open}
      accessibilityRole="button"
      accessibilityState={{ selected: picked, disabled: !open }}
      accessibilityLabel={selection ? `${fixture.homeTeam} v ${fixture.awayTeam}, ${selection.name} ${open ? formatOdds(selection.odds) : 'closed'}` : 'No price'}
      onPress={() =>
        market &&
        selection &&
        setSlip((current) =>
          toggleSelection(current, {
            fixtureId: fixture.fixtureId,
            fixtureName: `${fixture.homeTeam} v ${fixture.awayTeam}`,
            marketId: market.marketId,
            marketName: marketLabel(market.type),
            selectionId: selection.selectionId,
            selectionName: selection.name,
            odds: selection.odds,
            offerVersion: fixture.offerVersion,
          }),
        )
      }
      style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.price, { width }, hovered && open && !picked && styles.priceHover, picked && styles.pricePicked, !open && styles.priceClosed]}
    >
      <Text style={[styles.priceText, picked && styles.pickedText]} numberOfLines={1}>
        {open && selection ? formatOdds(selection.odds) : '–'}
      </Text>
    </Pressable>
  );
}

/** Today's coupon: every open match today in one dense list, main prices only, tap a price to add it to the slip. */
export function CouponScreen() {
  const wide = useIsWide();
  const fixtures = useFixtures();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const groups = todaysCoupon(fixtures.data ?? [], now);
  const cell = wide ? 62 : 46;
  const count = groups.reduce((n, g) => n + g.slots.reduce((m, s) => m + s.fixtures.length, 0), 0);
  const time = (iso: string) => new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.head}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.title} accessibilityRole="header">
            Today&apos;s coupon
          </Text>
          <Text style={styles.muted}>
            {now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })} · {fixtures.isSuccess ? `${count} open` : '…'}
          </Text>
        </View>
        <View style={styles.picker}>
          <OddsFormatPicker compact />
        </View>
      </View>

      {fixtures.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {fixtures.isError ? <EmptyState title="Matches could not load" message="Check your connection and try again." /> : null}
      {fixtures.isSuccess && groups.length === 0 ? <EmptyState title="No more matches today" message="Every match today has kicked off. Tomorrow's coupon opens at midnight." /> : null}

      {groups.map((group) => (
        <View key={group.competition} style={styles.group}>
          <View style={[styles.groupHead, !wide && styles.groupHeadNarrow]}>
            <View style={styles.groupTitle}>
              <Crest name={group.competition} size={18} />
              <Text style={styles.groupName} numberOfLines={1}>
                {group.competition}
              </Text>
            </View>
            {columns.map((c) => (
              <View key={c.type} style={styles.colGroup}>
                {c.labels.map((l) => (
                  <Text key={l} style={[styles.colLabel, { width: cell }]}>
                    {l}
                  </Text>
                ))}
              </View>
            ))}
          </View>
          {group.slots.map((slot) => (
            <View key={slot.kickoff}>
              <Text style={styles.slot}>{time(slot.kickoff)}</Text>
              {slot.fixtures.map((f) => (
                <View key={f.fixtureId} style={styles.row}>
                  <Link href={`/fixtures/${encodeURIComponent(f.fixtureId)}` as never} style={styles.teams} accessibilityLabel={`${f.homeTeam} v ${f.awayTeam}, all markets`}>
                    <Text style={styles.team} numberOfLines={wide ? 1 : 2}>
                      {f.homeTeam}
                      {wide ? <Text style={styles.v}> v </Text> : '\n'}
                      {f.awayTeam}
                    </Text>
                  </Link>
                  {columns.map((c) => {
                    const market = f.markets.find((m) => m.type === c.type);
                    return (
                      <View key={c.type} style={styles.colGroup}>
                        {c.labels.map((l, i) => (
                          <Price key={l} fixture={f} market={market} index={i} width={cell} />
                        ))}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 13 },
  picker: { minWidth: 200 },
  group: { backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  groupHeadNarrow: { flexWrap: 'wrap', justifyContent: 'flex-end' },
  groupTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, flexGrow: 1, flexBasis: 200, minWidth: 0 },
  groupName: { color: colors.text, fontWeight: '800', fontSize: 13, flexShrink: 1 },
  colGroup: { flexDirection: 'row', gap: 3, marginLeft: 6 },
  colLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  slot: { color: colors.textMuted, fontSize: 11, fontWeight: '800', fontVariant: ['tabular-nums'], paddingTop: spacing.xs + 2, paddingBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  teams: { flex: 1, minWidth: 0 },
  team: { color: colors.text, fontSize: 12, fontWeight: '700', lineHeight: 16 },
  v: { color: colors.textMuted, fontWeight: '400' },
  price: { height: 32, borderRadius: radius.sm, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  priceHover: { borderColor: colors.accent },
  pricePicked: { backgroundColor: colors.accent },
  priceClosed: { opacity: 0.4 },
  priceText: { color: colors.odds, fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
  pickedText: { color: '#ffffff' },
});
