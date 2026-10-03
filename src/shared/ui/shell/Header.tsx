import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unreadCount, useInbox } from '../../../features/inbox/api/inbox';
import { useBalance } from '../../../features/my-bets/api/myBets';
import { formatRand } from '../../lib/format';
import { openWallet } from '../../lib/links';
import { useSession } from '../../lib/useSession';
import { brandId, brandName } from '../../brand';
import { brand } from '../artwork';
import { GetTheApp } from '../GetTheApp';
import { Icon } from '../Icon';
import { useIsWide } from '../Layout';
import { colors, maxContentWidth, radius, spacing } from '../theme';

export function Logo() {
  return (
    <Link href="/" accessibilityLabel={`${brandName} home`}>
      {brandId === 'swiftbets' ? <Image source={brand.logo} style={styles.logoImage} resizeMode="contain" accessibilityLabel={brandName} /> : <Text style={styles.wordmark}>{brandName}</Text>}
    </Link>
  );
}

/** Logo, then the balance with Deposit when signed in, or Log in and Join when not. */
export function Header() {
  const wide = useIsWide();
  const insets = useSafeAreaInsets();
  const signedIn = useSession().data?.signedIn === true;
  const balance = useBalance();
  const unread = unreadCount(useInbox().data);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.inner}>
        <Logo />
        <View style={styles.grow} />
        {wide ? <GetTheApp /> : null}
        {signedIn ? (
          <>
            <Link href={'/inbox' as never} asChild>
              <Pressable accessibilityRole="link" accessibilityLabel={unread > 0 ? `Inbox, ${unread} unread` : 'Inbox'} style={styles.bell}>
                <Icon name="nav/notifications" size={26} />
                {unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                  </View>
                ) : null}
              </Pressable>
            </Link>
            <View style={styles.balance} accessibilityLabel="Balance">
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>{balance.data ? formatRand(balance.data.available.minorUnits, balance.data.available.currency) : '…'}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={openWallet} style={({ pressed }) => [styles.deposit, pressed && styles.pressed]}>
              <Text style={styles.depositText}>Deposit</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Link href="/account/sign-in" asChild>
              <Pressable accessibilityRole="link" style={styles.ghost}>
                <Text style={styles.ghostText}>Log in</Text>
              </Pressable>
            </Link>
            <Link href="/account/register" asChild>
              <Pressable accessibilityRole="link" style={styles.join}>
                <Text style={styles.joinText}>Join</Text>
              </Pressable>
            </Link>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: { color: colors.text, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  bar: { backgroundColor: colors.surfaceRaised, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, paddingHorizontal: spacing.md },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', minHeight: 40 },
  grow: { flex: 1 },
  bell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 0, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.live, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  logoImage: { height: 28, width: 148 },
  balance: { alignItems: 'flex-end', marginRight: spacing.xs },
  balanceLabel: { color: colors.textMuted, fontSize: 11 },
  balanceValue: { color: colors.text, fontWeight: '800', fontSize: 15, fontVariant: ['tabular-nums'] },
  deposit: { backgroundColor: colors.positive, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 14 },
  depositText: { color: colors.onPositive, fontWeight: '800', fontSize: 14 },
  ghost: { backgroundColor: colors.cardHigh, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 14 },
  ghostText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  join: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 16 },
  joinText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  pressed: { opacity: 0.85 },
});
