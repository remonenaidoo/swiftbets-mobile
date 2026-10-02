import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

export interface Category {
  href: string;
  label: string;
  glyph: string;
}

/** A row of icon tabs; the current one is a filled pill. Scrolls sideways on phones. */
export function CategoryBar({ items }: { items: Category[] }) {
  const pathname = usePathname();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.bar}>
      {items.map((item) => {
        const on = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('?')[0] ?? item.href);
        return (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable accessibilityRole="link" aria-current={on ? 'page' : undefined} style={StyleSheet.flatten([styles.item, on && styles.itemOn])}>
              <Text style={styles.glyph} aria-hidden>
                {item.glyph}
              </Text>
              <Text style={[styles.label, on && styles.labelOn]}>{item.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.surfaceRaised, flexGrow: 0 },
  row: { gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  item: { minWidth: 70, alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  itemOn: { backgroundColor: colors.accent },
  glyph: { fontSize: 20, marginBottom: 3 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  labelOn: { color: '#ffffff' },
});
