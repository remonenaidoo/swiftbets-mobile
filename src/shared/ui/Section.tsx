import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { IconName } from './artwork';
import { Icon } from './Icon';
import { colors, spacing } from './theme';

/** A section heading with an icon and an optional "see all" link, Stake-style. */
export function Section({ title, icon, href, more = 'See all', children }: { title: string; icon?: IconName; href?: string; more?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          {icon ? <Icon name={icon} size={28} /> : null}
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
        </View>
        {href ? (
          <Link href={href as never} style={styles.more}>
            {more} ›
          </Link>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm + 2 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  more: { color: colors.odds, fontSize: 13, fontWeight: '700' },
});
