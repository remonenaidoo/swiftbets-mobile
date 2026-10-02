import { CtaLink } from '../../../shared/ui/CtaLink';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { promos } from '../promos';

/** Rotates every seven seconds; the dots jump straight to a slide. */
export function PromoCarousel() {
  const wide = useIsWide();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % promos.length), 7000);
    return () => clearInterval(timer);
  }, []);
  const promo = promos[index] ?? promos[0]!;

  return (
    <View style={[styles.slide, { height: wide ? 230 : 172, experimental_backgroundImage: `linear-gradient(120deg, ${promo.tint[0]}, ${promo.tint[1]})` } as never, { backgroundColor: promo.tint[0] }]}>
      <View style={[styles.glow, { backgroundColor: promo.tint[1] }]} />
      <Text style={styles.kicker}>{promo.kicker}</Text>
      <Text style={[styles.title, wide && styles.titleWide]}>{promo.title}</Text>
      <Text style={styles.body} numberOfLines={2}>
        {promo.body}
      </Text>
      <CtaLink href={promo.href} label={promo.cta} style={styles.cta} textStyle={styles.ctaText} />
      <View style={styles.dots} role="tablist">
        {promos.map((p, i) => (
          <Pressable key={p.key} role="tab" aria-selected={i === index} accessibilityLabel={`Promotion ${i + 1} of ${promos.length}`} onPress={() => setIndex(i)} hitSlop={8}>
            <View style={[styles.dot, i === index && styles.dotOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { borderRadius: radius.lg, padding: spacing.lg - 4, overflow: 'hidden', justifyContent: 'center' },
  glow: { position: 'absolute', right: -60, top: -40, width: 260, height: 260, borderRadius: 130, opacity: 0.55 },
  kicker: { color: '#9fc0ff', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: '#ffffff', fontSize: 24, lineHeight: 27, fontWeight: '900', marginTop: 4, maxWidth: '70%' },
  titleWide: { fontSize: 38, lineHeight: 42 },
  body: { color: '#d3dcf5', fontSize: 13, marginTop: 6, maxWidth: '65%' },
  cta: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 16, marginTop: spacing.sm },
  ctaText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  dots: { position: 'absolute', bottom: 10, alignSelf: 'center', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ffffff55' },
  dotOn: { width: 20, backgroundColor: '#ffffff' },
});
