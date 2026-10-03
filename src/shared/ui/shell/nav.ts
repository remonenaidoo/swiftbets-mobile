import type { SportInfo } from '../../../features/sports/sports';
import type { Category } from './CategoryBar';

/** Home's quick links: home, every sport on offer, then bets, casino and promotions. */
export function homeCategories(sports: SportInfo[]): Category[] {
  return [
    { href: '/', label: 'Home', icon: 'nav/home' },
    ...sports.map((s) => ({ href: `/sports/${s.sportId}`, label: s.name, icon: s.icon })),
    { href: '/my-bets', label: 'My bets', icon: 'nav/my-bets' },
    { href: '/casino', label: 'Casino', icon: 'casino/slots' },
    { href: '/promotions', label: 'Promotions', icon: 'nav/promotions' },
  ];
}
