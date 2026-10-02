import { CtaLink } from '../../../shared/ui/CtaLink';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsWide } from '../../../shared/ui/Layout';
import { banners } from '../../../shared/ui/artwork';
import { Icon } from '../../../shared/ui/Icon';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { promos } from '../../home/promos';

/** Offer cards: artwork (a gradient until it arrives), the offer, and where it leads. */
export function PromotionsScreen() {
  const wide = useIsWide();
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.titleRow}>
        <Icon name="nav/promotions" size={34} />
        <Text style={styles.title} accessibilityRole="header">
          Promotions
        </Text>
      </View>
      <View style={styles.grid}>
        {promos.map((p) => (
          <View key={p.key} style={[styles.card, { width: wide ? '32%' : '100%' }]}>
            <View style={[styles.art, { backgroundColor: p.tint[0] }]}>
              <Image source={banners[p.banner]} style={styles.banner} resizeMode="cover" aria-hidden />
              <Text style={styles.kicker}>{p.kicker}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.cardTitle}>{p.title.replaceAll('\n', ' ')}</Text>
              <Text style={styles.text}>{p.body}</Text>
              <CtaLink href={p.href} label={p.cta} style={styles.cta} textStyle={styles.ctaText} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden' },
  art: { height: 140, padding: spacing.md, justifyContent: 'flex-end', overflow: 'hidden' },
  banner: { position: 'absolute', right: 0, top: 0, height: 140, width: 140 * 8.33 },
  kicker: { color: '#ffffff', fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  body: { padding: spacing.md, gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
  text: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  cta: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 16 },
  ctaText: { color: '#ffffff', fontWeight: '800' },
});
