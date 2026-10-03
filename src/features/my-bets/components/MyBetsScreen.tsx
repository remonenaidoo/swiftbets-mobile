import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { useSession } from '../../../shared/lib/useSession';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { CashoutPanel, canCashOut } from '../../cashout/components/CashoutPanel';
import { useBetHistory } from '../api/myBets';
import type { BetFilter, BetTypeFilter, RangeFilter, StatusFilter } from '../state/filters';
import { betTypeLabel, fixtureName, legLabel, tone, useLegFixtures } from './betDisplay';

const statuses: { key: StatusFilter; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
  { key: 'cashedOut', label: 'Cashed out' },
  { key: 'void', label: 'Void' },
  { key: 'all', label: 'All' },
];

const betTypes: { key: BetTypeFilter; label: string }[] = [
  { key: 'all', label: 'Any type' },
  { key: 'single', label: 'Singles' },
  { key: 'accumulator', label: 'Accumulators' },
  { key: 'system', label: 'System' },
];

const ranges: { key: RangeFilter; label: string }[] = [
  { key: 'all', label: 'Any time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
];

function Chips<K extends string>({ label, options, value, onChange }: { label: string; options: { key: K; label: string }[]; value: K; onChange: (key: K) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityLabel={label} role="radiogroup">
      {options.map((o) => (
        <Pressable key={o.key} role="radio" aria-checked={value === o.key} onPress={() => onChange(o.key)} style={[styles.chip, value === o.key && styles.chipActive]}>
          <Text style={[styles.chipText, value === o.key && styles.chipTextActive]}>{o.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const emptyTitles: Record<StatusFilter, string> = {
  open: 'No open bets',
  won: 'No winning bets',
  lost: 'No losing bets',
  cashedOut: 'No cashed out bets',
  void: 'No void bets',
  all: 'No bets yet',
};

export function MyBetsScreen() {
  const [filter, setFilter] = useState<BetFilter>({ status: 'open', betType: 'all', range: 'all' });
  const bets = useBetHistory(filter);
  const router = useRouter();
  const signedIn = useSession().data?.signedIn === true;
  const coupons = bets.data?.pages.flat() ?? [];
  const fixtures = useLegFixtures(coupons.flatMap((c) => (c.legs ?? []).map((l) => l.fixtureId)));
  const filtered = filter.betType !== 'all' || filter.range !== 'all';

  if (!signedIn) {
    return <EmptyState title="Sign in to see your bets" message="Your bets appear here once you are signed in." />;
  }

  return (
    <FlatList
      data={bets.isPending || bets.isError ? [] : coupons}
      keyExtractor={(c) => c.couponId}
      contentContainerStyle={styles.list}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (bets.hasNextPage && !bets.isFetchingNextPage) {
          void bets.fetchNextPage();
        }
      }}
      ListHeaderComponent={
        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            My bets
          </Text>
          <Chips label="Result" options={statuses} value={filter.status} onChange={(status) => setFilter((f) => ({ ...f, status }))} />
          <Chips label="Bet type" options={betTypes} value={filter.betType} onChange={(betType) => setFilter((f) => ({ ...f, betType }))} />
          <Chips label="Placed" options={ranges} value={filter.range} onChange={(range) => setFilter((f) => ({ ...f, range }))} />
        </View>
      }
      ListEmptyComponent={
        bets.isPending ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : bets.isError ? (
          <EmptyState title="Could not load your bets" message="Check your connection and try again." />
        ) : (
          <EmptyState
            title={emptyTitles[filter.status]}
            message={filtered ? 'Nothing matches these filters. Try a wider date range or another bet type.' : filter.status === 'open' ? 'Bets appear here the moment they are placed, and you can cash them out before they settle.' : 'Settled bets appear here, with what each one paid.'}
          />
        )
      }
      ListFooterComponent={bets.isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={styles.footer} /> : null}
      renderItem={({ item }) => {
        const t = tone(item);
        return (
          <View style={styles.card}>
            <Pressable
              role="link"
              accessibilityLabel={`Bet details, ${t.label}`}
              onPress={() => router.push(`/my-bets/${item.couponId}` as never)}
              style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.summary, hovered && styles.summaryHover]}
            >
              <View style={styles.row}>
                <Text style={styles.type}>
                  {betTypeLabel(item, item.legs?.length ?? 0)} @ {formatOdds(item.totalOdds ?? 0)}
                </Text>
                <Text style={[styles.badge, { color: t.color, borderColor: t.color }]}>{t.label}</Text>
              </View>
              {(item.legs ?? []).map((leg) => (
                <Text key={leg.legId} style={styles.leg} numberOfLines={1}>
                  {legLabel(leg, fixtures.get(leg.fixtureId))} @ {formatOdds(leg.odds)} · {fixtureName(fixtures.get(leg.fixtureId))}
                </Text>
              ))}
              <View style={styles.row}>
                <Text style={styles.muted}>
                  Stake {formatRand(item.stake ?? 0, item.currency)}
                  {item.placedAt ? ` · ${new Date(item.placedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}` : ''}
                </Text>
                <Text style={[styles.amount, item.paidToDate > 0 && { color: colors.positive }]}>
                  {item.paidToDate > 0
                    ? `Paid ${formatRand(item.paidToDate, item.currency)}`
                    : item.status === 'lost'
                      ? 'No return'
                      : `Returns ${formatRand(item.potentialPayout ?? 0, item.currency)}`}
                </Text>
              </View>
            </Pressable>
            {canCashOut(item) ? <CashoutPanel coupon={item} /> : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  footer: { marginVertical: spacing.md },
  list: { padding: spacing.md, gap: spacing.sm + 2, paddingBottom: 40, width: '100%', maxWidth: 900, alignSelf: 'center' },
  heading: { gap: spacing.sm, marginBottom: spacing.xs },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  chips: { gap: spacing.xs + 2, paddingVertical: 2 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textMuted, fontWeight: '800', fontSize: 13 },
  chipTextActive: { color: '#ffffff' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md - 2, gap: 6 },
  summary: { gap: 6, borderRadius: radius.md },
  summaryHover: { opacity: 0.85 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  type: { color: colors.text, fontWeight: '800', flexShrink: 1 },
  badge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 2, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  leg: { color: colors.textMuted, fontSize: 13 },
  muted: { color: colors.textMuted, fontSize: 13 },
  amount: { color: colors.text, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
