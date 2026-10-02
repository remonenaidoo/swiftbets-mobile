export interface Promo {
  key: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Two colours for the gradient behind the text until the artwork is in. */
  tint: [string, string];
}

export const promos: Promo[] = [
  { key: 'live', kicker: 'Premier League · live prices', title: 'Every match.\nLive prices.', body: 'Build a single or an accumulator and cash out before the final whistle.', cta: 'Bet on football', href: '/sports/soccer', tint: ['#18264a', '#3b1d63'] },
  { key: 'cashout', kicker: 'Cash out', title: 'Take your\nwinnings early.', body: 'Open singles and accumulators can be cashed out at the live price.', cta: 'My bets', href: '/my-bets', tint: ['#0f3b2e', '#145a8a'] },
  { key: 'safe', kicker: 'Safer gambling', title: 'Set your\nown limits.', body: 'Deposit limits, session reminders and breaks, all in your account.', cta: 'Set limits', href: '/account/safer-gambling', tint: ['#2a1a4a', '#7a2d55'] },
];
