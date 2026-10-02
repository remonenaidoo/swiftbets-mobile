export interface Tile {
  key: string;
  label: string;
  caption: string;
  glyph: string;
  href?: string;
  tint: string;
}

/** Football is live; the rest are on the roadmap and say so instead of leading nowhere. */
export const sportTiles: Tile[] = [
  { key: 'soccer', label: 'Football', caption: 'Live prices now', glyph: '⚽', href: '/sports/soccer', tint: '#1d4ed8' },
  { key: 'tennis', label: 'Tennis', caption: 'Coming soon', glyph: '🎾', tint: '#15803d' },
  { key: 'basketball', label: 'Basketball', caption: 'Coming soon', glyph: '🏀', tint: '#c2410c' },
  { key: 'cricket', label: 'Cricket', caption: 'Coming soon', glyph: '🏏', tint: '#0f766e' },
  { key: 'rugby', label: 'Rugby', caption: 'Coming soon', glyph: '🏉', tint: '#7c2d12' },
  { key: 'horse-racing', label: 'Horse racing', caption: 'Coming soon', glyph: '🏇', tint: '#6d28d9' },
];

export const casinoTiles: Tile[] = [
  { key: 'slots', label: 'Slots', caption: 'Coming soon', glyph: '🎰', tint: '#be185d' },
  { key: 'roulette', label: 'Roulette', caption: 'Coming soon', glyph: '🎡', tint: '#b91c1c' },
  { key: 'blackjack', label: 'Blackjack', caption: 'Coming soon', glyph: '🃏', tint: '#374151' },
  { key: 'live-casino', label: 'Live casino', caption: 'Coming soon', glyph: '🎲', tint: '#a16207' },
];
