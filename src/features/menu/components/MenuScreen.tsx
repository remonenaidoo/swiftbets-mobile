import { brandName } from '../../../shared/brand';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatRand } from '../../../shared/lib/format';
import { isSitePath, openSite, openWallet } from '../../../shared/lib/links';
import { useSession } from '../../../shared/lib/useSession';
import type { IconName } from '../../../shared/ui/artwork';
import { GetTheApp } from '../../../shared/ui/GetTheApp';
import { Icon } from '../../../shared/ui/Icon';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { useSignOut } from '../../account/api/account';
import { useFixtures } from '../../fixtures/api/fixtures';
import { useBalance } from '../../my-bets/api/myBets';

const tiles = [
  { href: '/promotions', label: 'Promotions', icon: 'nav/promotions' as IconName },
  { href: '/my-bets', label: 'My bets', icon: 'nav/my-bets' as IconName },
  { href: '/sports/soccer', label: 'Football', icon: 'sports/football' as IconName },
  { href: '/racing', label: 'Racing', icon: 'sports/horse-racing' as IconName },
  { href: '/casino', label: 'Casino', icon: 'nav/casino' as IconName },
];

const rows = [
  { href: '/inbox', label: 'Inbox', icon: 'nav/notifications' as IconName },
  { href: '/notifications', label: 'Notification settings', icon: 'nav/settings' as IconName },
  { href: '/account', label: 'Account', icon: 'nav/account' as IconName },
  { href: '/account/wallet', label: 'Wallet & transactions', icon: 'nav/transactions' as IconName },
  { href: '/account/safer-gambling', label: 'Safer gambling & limits', icon: 'nav/safer-gambling' as IconName },
];

/** The phone menu: account card, search across open matches, quick tiles, then account links. */
export function MenuScreen() {
  const signedIn = useSession().data?.signedIn === true;
  const balance = useBalance();
  const signOut = useSignOut();
  const fixtures = useFixtures();
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = q.length < 2 ? [] : (fixtures.data ?? []).filter((f) => `${f.homeTeam} ${f.awayTeam} ${f.competition}`.toLowerCase().includes(q)).slice(0, 6);
  const amount = balance.data ? formatRand(balance.data.available.minorUnits, balance.data.available.currency) : '…';

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {signedIn ? (
        <View style={styles.account}>
          <Text style={styles.hello}>Your account</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'} onPress={() => setHidden((h) => !h)}>
            <Text style={styles.balance}>
              {hidden ? 'R •••••' : amount} <Text style={styles.eye}>{hidden ? '🙈' : '👁'}</Text>
            </Text>
          </Pressable>
          <Text style={styles.available}>Available to bet</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={openWallet} style={[styles.action, styles.deposit]}>
              <Text style={styles.depositText}>Deposit</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={openWallet} style={[styles.action, styles.withdraw]}>
              <Text style={styles.withdrawText}>Withdraw</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.account}>
          <Text style={styles.hello}>Welcome to {brandName}</Text>
          <View style={styles.actions}>
            <Link href="/account/sign-in" asChild>
              <Pressable style={StyleSheet.flatten([styles.action, styles.withdraw])}>
                <Text style={styles.withdrawText}>Log in</Text>
              </Pressable>
            </Link>
            <Link href="/account/register" asChild>
              <Pressable style={StyleSheet.flatten([styles.action, styles.deposit])}>
                <Text style={styles.depositText}>Join</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      )}

      <TextInput value={query} onChangeText={setQuery} placeholder="🔍  Search teams and competitions" placeholderTextColor={colors.textMuted} accessibilityLabel="Search teams and competitions" style={styles.search} />
      {matches.map((f) => (
        <Link key={f.fixtureId} href={`/fixtures/${encodeURIComponent(f.fixtureId)}` as never} asChild>
          <Pressable style={styles.row}>
            <Text style={styles.rowText}>
              {f.homeTeam} v {f.awayTeam}
            </Text>
            <Text style={styles.rowMeta}>{f.competition} ›</Text>
          </Pressable>
        </Link>
      ))}
      {q.length >= 2 && matches.length === 0 ? <Text style={styles.rowMeta}>No open match matches “{query}”.</Text> : null}

      <View style={styles.tiles}>
        {tiles.map((t) => (
          <Link key={t.href} href={t.href as never} asChild>
            <Pressable style={styles.tile}>
              <Icon name={t.icon} size={32} />
              <Text style={styles.tileText}>{t.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      {signedIn
        ? rows.map((r) => (
            <Pressable key={r.href} accessibilityRole="link" onPress={() => (isSitePath(r.href) ? openSite(r.href) : router.push(r.href as never))} style={styles.row}>
              <View style={styles.rowLead}>
                <Icon name={r.icon} size={26} />
                <Text style={styles.rowText}>{r.label}</Text>
              </View>
              <Text style={styles.rowMeta}>›</Text>
            </Pressable>
          ))
        : null}
      {signedIn ? (
        <Pressable accessibilityRole="button" onPress={() => signOut.mutate()} style={styles.row}>
          <Text style={styles.rowText}>↩ Sign out</Text>
        </Pressable>
      ) : null}
      <View style={styles.app}>
        <GetTheApp />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.sm + 2, paddingBottom: 40 },
  account: { borderRadius: radius.lg, padding: spacing.md, gap: 4, backgroundColor: '#1d47c8', experimental_backgroundImage: 'linear-gradient(135deg, #1b3a8a, #2f6bff)' } as never,
  hello: { color: '#d7e3ff', fontSize: 14, fontWeight: '700' },
  balance: { color: '#ffffff', fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'] },
  eye: { fontSize: 16 },
  available: { color: '#c2d3ff', fontSize: 12 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  action: { flex: 1, borderRadius: radius.md, paddingVertical: 11, alignItems: 'center' },
  deposit: { backgroundColor: colors.positive },
  depositText: { color: colors.onPositive, fontWeight: '900' },
  withdraw: { backgroundColor: '#ffffff26' },
  withdrawText: { color: '#ffffff', fontWeight: '800' },
  search: { color: colors.text, backgroundColor: colors.surfaceSunken, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 14 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 12 },
  tileText: { color: colors.text, fontWeight: '800', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 14 },
  rowLead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, flexShrink: 1 },
  rowText: { color: colors.text, fontWeight: '700', fontSize: 14, flexShrink: 1 },
  rowMeta: { color: colors.textMuted, fontSize: 12 },
  app: { alignItems: 'center', marginTop: spacing.md },
});
