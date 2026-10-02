import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from './theme';

/** A section heading with an icon and an optional "see all" link, Stake-style. */
export function Section({ title, glyph, href, more = 'See all', children }: { title: string; glyph?: string; href?: string; more?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          {glyph ? `${glyph}  ` : ''}
          {title}
        </Text>
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
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  more: { color: colors.odds, fontSize: 13, fontWeight: '700' },
});
