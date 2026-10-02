// Slate surfaces with one blue accent; green moves money, red marks live, gold marks wins.
export const colors = {
  surface: '#0e1621',
  surfaceRaised: '#162231',
  surfaceSunken: '#0a111a',
  card: '#1d2c3e',
  cardHigh: '#263850',
  border: '#2a3d55',
  text: '#eef3fa',
  textMuted: '#8fa3bd',
  accent: '#2563eb',
  accentStrong: '#2563eb',
  odds: '#5cc8ff',
  positive: '#26d07c',
  onPositive: '#04230f',
  negative: '#ff3b5c',
  live: '#ff3b5c',
  warning: '#f5a524',
  gold: '#ffc53d',
  selected: '#2563eb',
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
