import { ScrollView, StyleSheet } from 'react-native';
import { icons, type IconName } from '../../../shared/ui/artwork';
import { CtaLink } from '../../../shared/ui/CtaLink';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { useHomeContent, type QuickLink } from '../../content/api/content';

/** Shown until the console's quick links load, and if the content API is down. */
export const fallbackQuickLinks: QuickLink[] = [
  { id: 'football', label: 'Football', link: '/sports/soccer', icon: 'sports/football' },
  { id: 'my-bets', label: 'My bets', link: '/my-bets', icon: 'nav/my-bets' },
  { id: 'help', label: 'Help', link: '/help', icon: 'nav/chat' },
  { id: 'safer', label: 'Safer gambling', link: '/responsible-gambling', icon: 'nav/safer-gambling' },
];

export function QuickLinks() {
  const content = useHomeContent();
  const links = content.data?.quickLinks.length ? content.data.quickLinks : fallbackQuickLinks;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} role="navigation" aria-label="Quick links">
      {links.map((l) => (
        <CtaLink key={l.id} href={l.link} label={l.label} style={styles.chip} textStyle={styles.text} icon={l.icon && l.icon in icons ? (l.icon as IconName) : undefined} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14 },
  text: { color: colors.text, fontWeight: '800', fontSize: 13 },
});
