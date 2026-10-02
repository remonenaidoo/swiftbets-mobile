import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { IconName } from '../artwork';
import { Icon } from '../Icon';
import { colors, radius, spacing } from '../theme';

export interface Category {
  href: string;
  label: string;
  icon: IconName;
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
              <Icon name={item.icon} size={30} />
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
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '700', marginTop: 3 },
  labelOn: { color: '#ffffff' },
});
