import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../shared/ui/theme';

/** Shared pieces of the racing screens, matching the betslip and fixture cards. */
export const rs = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  text: { color: colors.text, fontSize: 14 },
  strong: { color: colors.text, fontSize: 15, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 13 },
  small: { color: colors.textMuted, fontSize: 12 },
  error: { color: colors.negative, fontSize: 13 },
  success: { color: colors.positive, fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.surfaceSunken, borderWidth: 2, borderColor: 'transparent' },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.cardHigh },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  price: { minWidth: 58, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: radius.sm, backgroundColor: colors.cardHigh, borderWidth: 2, borderColor: 'transparent' },
  priceOn: { borderColor: colors.accent, backgroundColor: colors.selected },
  priceText: { color: colors.odds, fontWeight: '800', fontSize: 15, fontVariant: ['tabular-nums'] },
  priceLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  input: { color: colors.text, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceSunken },
  button: { backgroundColor: colors.positive, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  buttonWarn: { backgroundColor: colors.warning },
  buttonText: { color: colors.onPositive, fontWeight: '900', fontSize: 16 },
  buttonDisabled: { opacity: 0.45 },
});

export const statusLabel: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
  off: 'Off',
  result: 'Result',
  official: 'Official',
  abandoned: 'Abandoned',
};

export function statusColor(status: string): string {
  if (status === 'open') {
    return colors.positive;
  }
  if (status === 'off') {
    return colors.live;
  }
  if (status === 'abandoned') {
    return colors.negative;
  }
  return colors.textMuted;
}

export function postTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
}
