import type { ImageSourcePropType } from 'react-native';
import { banners } from '../../shared/ui/artwork';
import type { SiteBanner } from '../content/api/content';

export interface Promo {
  key: string;
  kicker?: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Fallback colours while the banner loads. */
  tint: [string, string];
  banner: ImageSourcePropType;
}

export const promos: Promo[] = [
  { key: 'live', kicker: 'Premier League · live prices', title: 'Every match.\nLive prices.', body: 'Build a single or an accumulator and cash out before the final whistle.', cta: 'Bet on football', href: '/sports/soccer', tint: ['#0b1a44', '#14306e'], banner: banners.football },
  { key: 'cashout', kicker: 'Cash out', title: 'Take your\nwinnings early.', body: 'Open singles and accumulators can be cashed out at the live price.', cta: 'My bets', href: '/my-bets', tint: ['#0b1a44', '#14306e'], banner: banners.win },
  { key: 'safe', kicker: 'Safer gambling', title: 'Set your\nown limits.', body: 'Deposit limits, session reminders and breaks, all in your account.', cta: 'Set limits', href: '/account/safer-gambling', tint: ['#0b1a44', '#14306e'], banner: banners.casino },
];

/** Bundled artwork by name, else a /static/ or https image; anything else falls back to the football artwork. */
export function bannerImage(key: string): ImageSourcePropType {
  if (key in banners) return banners[key as keyof typeof banners];
  return key.startsWith('/static/') || key.startsWith('https://') ? { uri: key } : banners.football;
}

/** The console's banners as slides; with none live (or the content API down) the built-in slides show. */
export function promosFrom(site: SiteBanner[] | undefined): Promo[] {
  if (!site || site.length === 0) return promos;
  return site.map((b) => ({
    key: b.id,
    title: b.title,
    body: b.subtitle ?? '',
    cta: b.ctaLabel ?? (b.link ? 'Find out more' : ''),
    href: b.link ?? '',
    tint: ['#0b1a44', '#14306e'],
    banner: bannerImage(b.imageKey),
  }));
}
