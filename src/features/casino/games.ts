export interface GameCard {
  key: string;
  name: string;
  category: 'slots' | 'live' | 'crash';
  tag?: 'NEW' | 'EXCLUSIVE';
  tint: [string, string];
}

/** The lobby's shelf until the casino service (E5) serves the real catalogue; every card says it is coming soon. */
export const comingSoonGames: GameCard[] = [
  { key: 'sun-temple', name: 'Sun Temple', category: 'slots', tag: 'EXCLUSIVE', tint: ['#ffb347', '#c2410c'] },
  { key: 'deep-blue', name: 'Deep Blue', category: 'slots', tag: 'NEW', tint: ['#38bdf8', '#1e3a8a'] },
  { key: 'gold-rush', name: 'Gold Rush 500', category: 'slots', tint: ['#fde047', '#a16207'] },
  { key: 'rose-nights', name: 'Rose Nights', category: 'slots', tint: ['#f472b6', '#9d174d'] },
  { key: 'jungle-kong', name: 'Jungle Kong', category: 'slots', tag: 'NEW', tint: ['#34d399', '#065f46'] },
  { key: 'lightning-roulette', name: 'Lightning Roulette', category: 'live', tint: ['#a78bfa', '#6d28d9'] },
  { key: 'vip-blackjack', name: 'VIP Blackjack', category: 'live', tint: ['#60a5fa', '#1e3a8a'] },
  { key: 'crazy-wheel', name: 'Crazy Wheel', category: 'live', tint: ['#fb923c', '#9a3412'] },
  { key: 'jet-rush', name: 'Jet Rush', category: 'crash', tag: 'EXCLUSIVE', tint: ['#facc15', '#1f2937'] },
  { key: 'rocket', name: 'Rocket', category: 'crash', tint: ['#f87171', '#7f1d1d'] },
];
