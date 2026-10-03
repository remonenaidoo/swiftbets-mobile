import type { IconName } from '../../shared/ui/artwork';
import type { CatalogSport, Fixture } from '../../shared/lib/types';

export interface SportInfo {
  sportId: string;
  name: string;
  icon: IconName;
}

// Shown before the catalogue loads, and the icon for each sport the catalogue names.
export const knownSports: SportInfo[] = [
  { sportId: 'soccer', name: 'Football', icon: 'sports/football' },
  { sportId: 'tennis', name: 'Tennis', icon: 'sports/tennis' },
  { sportId: 'rugby-union', name: 'Rugby union', icon: 'sports/rugby' },
  { sportId: 'cricket', name: 'Cricket', icon: 'sports/cricket' },
  { sportId: 'basketball', name: 'Basketball', icon: 'sports/basketball' },
];

/** The fixture's sport; fixtures from before sports were added carry none and are football. */
export function sportOf(fixture: Pick<Fixture, 'sport'>): string {
  return fixture.sport || 'soccer';
}

export function sportInfo(sportId: string, catalog?: CatalogSport[]): SportInfo {
  const known = knownSports.find((s) => s.sportId === sportId);
  const listed = catalog?.find((s) => s.sportId === sportId);
  return { sportId, name: listed?.name ?? known?.name ?? 'Sports', icon: known?.icon ?? 'nav/sports' };
}

/** Every sport to link to: the catalogue's when it has loaded, otherwise the known list. */
export function sportsMenu(catalog?: CatalogSport[]): SportInfo[] {
  return catalog && catalog.length > 0 ? catalog.map((s) => sportInfo(s.sportId, catalog)) : knownSports;
}

/** An outright is a whole competition with one winner market, not a match between two sides. */
export function isOutright(fixture: Pick<Fixture, 'fixtureId' | 'awayTeam'>): boolean {
  return fixture.fixtureId.endsWith('-outright') || !fixture.awayTeam;
}

export function fixtureName(fixture: Pick<Fixture, 'fixtureId' | 'homeTeam' | 'awayTeam'>): string {
  return isOutright(fixture) ? fixture.homeTeam : `${fixture.homeTeam} v ${fixture.awayTeam}`;
}
