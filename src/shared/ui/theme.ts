import { brandTokens } from '../brand';

// Slate surfaces with one blue accent; green moves money, red marks live, gold marks wins.
const c = brandTokens.color;

export const colors = {
  surface: c.surface,
  surfaceRaised: c.surfaceRaised,
  surfaceSunken: c.surfaceSunken,
  card: c.card,
  cardHigh: c.cardHigh,
  border: c.border,
  text: c.text,
  textMuted: c.textMuted,
  accent: c.accentStrong,
  accentStrong: c.accentStrong,
  odds: c.odds,
  positive: c.positive,
  onPositive: c.onPositive,
  negative: c.negative,
  live: c.live,
  warning: c.warning,
  gold: c.gold,
  selected: c.selected,
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const type = {
  title: { fontSize: 24, fontWeight: '800' as const, color: colors.text },
  section: { fontSize: 18, fontWeight: '800' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
};

/** Wide screens get a left menu and the betslip as a sidebar; narrow ones a bottom bar and sheet. */
export const wideBreakpoint = 1024;

export const maxContentWidth = 1440;
