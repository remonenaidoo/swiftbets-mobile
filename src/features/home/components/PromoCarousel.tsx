import { CtaLink } from '../../../shared/ui/CtaLink';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { banners } from '../../../shared/ui/artwork';
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
  const height = wide ? 260 : 180;

  return (
    <View style={[styles.slide, { height, backgroundColor: promo.tint[0] }]}>
      {/* The banner's artwork sits on its right; anchoring it there keeps it in view at any width. */}
      <Image source={banners[promo.banner]} style={[styles.banner, { height, width: height * 8.33 }]} resizeMode="cover" aria-hidden />
      {/* A stepped fade from the left keeps the text legible over busy artwork. */}
      {scrim.map((step) => (
        <View key={step.width} style={[styles.scrim, { width: step.width, opacity: step.opacity }]} />
      ))}
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

const scrim = [
  { width: '84%', opacity: 0.085 },
  { width: '80%', opacity: 0.085 },
  { width: '76%', opacity: 0.085 },
  { width: '72%', opacity: 0.085 },
  { width: '68%', opacity: 0.085 },
  { width: '64%', opacity: 0.085 },
  { width: '60%', opacity: 0.085 },
  { width: '56%', opacity: 0.085 },
  { width: '52%', opacity: 0.085 },
  { width: '48%', opacity: 0.085 },
  { width: '44%', opacity: 0.085 },
  { width: '40%', opacity: 0.085 },
] as const;

const styles = StyleSheet.create({
  scrim: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#06102a' },
  slide: { borderRadius: radius.lg, padding: spacing.lg - 4, overflow: 'hidden', justifyContent: 'center' },
  banner: { position: 'absolute', right: 0, top: 0 },
  kicker: { color: '#9fc0ff', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: '#ffffff', fontSize: 24, lineHeight: 27, fontWeight: '900', marginTop: 4, maxWidth: '62%', textShadowColor: '#000000aa', textShadowRadius: 8 },
  titleWide: { fontSize: 38, lineHeight: 42 },
  body: { color: '#d3dcf5', fontSize: 13, marginTop: 6, maxWidth: '55%', textShadowColor: '#000000aa', textShadowRadius: 6 },
  cta: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 16, marginTop: spacing.sm },
  ctaText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  dots: { position: 'absolute', bottom: 10, alignSelf: 'center', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ffffff55' },
  dotOn: { width: 20, backgroundColor: '#ffffff' },
});
