export const colors = {
  surface: '#0b1220',
  surfaceRaised: '#121b2e',
  surfaceSunken: '#070c16',
  border: '#22304d',
  text: '#e6ecf5',
  textMuted: '#93a1b8',
  accent: '#3b82f6',
  accentStrong: '#2563eb',
  positive: '#22c55e',
  negative: '#ef4444',
  warning: '#f59e0b',
  selected: '#1d3b6e',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 14 } as const;

/** Wide screens get the betslip as a sidebar; narrow ones get a bottom bar and sheet. */
export const wideBreakpoint = 1024;

export const maxContentWidth = 1280;
