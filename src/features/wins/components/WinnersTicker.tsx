import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatRand } from '../../../shared/lib/format';
import { Icon } from '../../../shared/ui/Icon';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { betTypeLabel, useRecentWins } from '../api/recentWins';

/** Real recent wins with masked accounts; renders nothing until there is at least one. */
export function WinnersTicker() {
  const wins = useRecentWins();
  if (!wins.data || wins.data.length === 0) {
    return null;
  }
  return (
    <View style={styles.bar} accessibilityLabel="Recent wins">
      <View style={styles.lead}>
        <Icon name="sports/trophy" size={26} />
        <Text style={styles.leadText}>Recent wins</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {wins.data.map((w) => (
          <View key={w.couponId} style={styles.win}>
            <Text style={styles.amount}>{formatRand(w.payout.minorUnits, w.payout.currency)}</Text>
            <Text style={styles.meta}>
              {w.account}
              {betTypeLabel(w.betType) ? ` · ${betTypeLabel(w.betType)}` : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.md - 4 },
  lead: { alignItems: 'center', gap: 2, paddingRight: spacing.sm, borderRightWidth: 1, borderRightColor: colors.border },
  leadText: { color: colors.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { gap: spacing.md, alignItems: 'center' },
  win: { gap: 1 },
  amount: { color: colors.gold, fontWeight: '900', fontSize: 15, fontVariant: ['tabular-nums'] },
  meta: { color: colors.textMuted, fontSize: 11, fontVariant: ['tabular-nums'] },
});
