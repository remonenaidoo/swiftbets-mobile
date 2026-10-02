import { Link, usePathname } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { slipAtom } from '../../../features/betslip/state/betslip';
import { slipSheetAtom } from '../../../features/betslip/state/slipSheet';
import { colors, radius, spacing } from '../theme';

const tabs = [
  { href: '/', label: 'Home', glyph: '🏠' },
  { href: '/sports/soccer', label: 'Sports', glyph: '⚽' },
  { href: '/casino', label: 'Casino', glyph: '🎰' },
  { href: '/menu', label: 'Menu', glyph: '☰' },
] as const;

function Tab({ href, label, glyph }: (typeof tabs)[number]) {
  const pathname = usePathname();
  const on = href === '/' ? pathname === '/' : pathname.startsWith(href.split('/').slice(0, 2).join('/'));
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" aria-current={on ? 'page' : undefined} style={styles.tab}>
        {on ? <View style={styles.marker} /> : null}
        <Text style={styles.glyph} aria-hidden>
          {glyph}
        </Text>
        <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
      </Pressable>
    </Link>
  );
}

/** Phones: Home · Sports · Betslip (raised, with its count) · Casino · Menu. */
export function BottomNav() {
  const insets = useSafeAreaInsets();
  const count = useAtomValue(slipAtom).length;
  const openSlip = useSetAtom(slipSheetAtom);
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]} role="navigation" aria-label="Main">
      <Tab {...tabs[0]} />
      <Tab {...tabs[1]} />
      <Pressable accessibilityRole="button" accessibilityLabel={`Open betslip, ${count} selections`} onPress={() => openSlip(true)} style={styles.slip}>
        <Text style={styles.glyph} aria-hidden>
          🧾
        </Text>
        <Text style={styles.slipLabel}>Betslip</Text>
        {count > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        ) : null}
      </Pressable>
      <Tab {...tabs[2]} />
      <Tab {...tabs[3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', backgroundColor: colors.surfaceRaised, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  tab: { alignItems: 'center', minWidth: 60, paddingVertical: 2 },
  marker: { position: 'absolute', top: -spacing.sm - 1, width: 28, height: 3, borderRadius: 3, backgroundColor: colors.accent },
  glyph: { fontSize: 20 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  labelOn: { color: colors.text },
  slip: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 14, marginTop: -22, shadowColor: colors.accent, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  slipLabel: { color: '#ffffff', fontSize: 11, fontWeight: '800', marginTop: 2 },
  badge: { position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.live, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
});
