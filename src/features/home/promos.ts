export interface Promo {
  key: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Fallback colours while the banner loads. */
  tint: [string, string];
  banner: 'football' | 'casino' | 'win';
}

export const promos: Promo[] = [
  { key: 'live', kicker: 'Premier League · live prices', title: 'Every match.\nLive prices.', body: 'Build a single or an accumulator and cash out before the final whistle.', cta: 'Bet on football', href: '/sports/soccer', tint: ['#0b1a44', '#14306e'], banner: 'football' },
  { key: 'cashout', kicker: 'Cash out', title: 'Take your\nwinnings early.', body: 'Open singles and accumulators can be cashed out at the live price.', cta: 'My bets', href: '/my-bets', tint: ['#0b1a44', '#14306e'], banner: 'win' },
  { key: 'safe', kicker: 'Safer gambling', title: 'Set your\nown limits.', body: 'Deposit limits, session reminders and breaks, all in your account.', cta: 'Set limits', href: '/account/safer-gambling', tint: ['#0b1a44', '#14306e'], banner: 'casino' },
];
