import { Link, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Betslip } from '../../features/betslip/components/Betslip';
import { BetslipDock } from '../../features/betslip/components/BetslipDock';
import { useBalance } from '../../features/my-bets/api/myBets';
import { formatRand } from '../lib/format';
import { useIsWide } from './Layout';
import { GetTheApp } from './GetTheApp';
import { Toast } from './Toast';
import { colors, maxContentWidth, radius, spacing } from './theme';

const nav = [
  { href: '/', label: 'Sports' },
  { href: '/my-bets', label: 'My bets' },
] as const;

export function AppFrame({ children }: { children: ReactNode }) {
  const wide = useIsWide();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const balance = useBalance();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerInner}>
          <Text style={styles.brand} accessibilityRole="header">
            SWIFT<Text style={styles.brandAccent}>BETS</Text>
          </Text>
          <View style={styles.nav} accessibilityRole="tablist">
            {nav.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} asChild>
                  <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} style={StyleSheet.flatten([styles.navItem, active && styles.navItemActive])}>
                    <Text style={StyleSheet.flatten([styles.navText, active && styles.navTextActive])}>{item.label}</Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
          {wide ? <GetTheApp /> : null}
          <View style={styles.balance} accessibilityLabel="Balance">
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>{balance.data ? formatRand(balance.data.available.minorUnits, balance.data.available.currency) : '…'}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={styles.main}>{children}</View>
        {wide ? (
          <View style={styles.sidebar}>
            <Betslip />
          </View>
        ) : null}
      </View>
      {wide ? null : <BetslipDock />}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { backgroundColor: colors.surfaceSunken, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, paddingHorizontal: spacing.md },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', flexWrap: 'wrap' },
  brand: { color: '#ffffff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  brandAccent: { color: colors.accent },
  nav: { flexDirection: 'row', gap: spacing.xs, flex: 1 },
  navItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md },
  navItemActive: { backgroundColor: colors.surfaceRaised },
  navText: { color: colors.textMuted, fontWeight: '600' },
  navTextActive: { color: '#ffffff' },
  balance: { alignItems: 'flex-end' },
  balanceLabel: { color: colors.textMuted, fontSize: 11 },
  balanceValue: { color: colors.positive, fontWeight: '700', fontSize: 15, fontVariant: ['tabular-nums'] },
  body: { flex: 1 },
  bodyWide: { flexDirection: 'row', width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  main: { flex: 1 },
  sidebar: { width: 360, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.surfaceRaised },
});
