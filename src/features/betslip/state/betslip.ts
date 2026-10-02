import { atom } from 'jotai';
import type { Fixture } from '../../../shared/lib/types';

export interface SlipSelection {
  fixtureId: string;
  fixtureName: string;
  marketId: string;
  marketName: string;
  selectionId: string;
  selectionName: string;
  odds: number;
  offerVersion: number;
  /** Set when the live price moved after it was added; placing needs the punter to accept the new price first. */
  previousOdds?: number;
  suspended?: boolean;
  /** In a system bet, a banker is in every line. */
  banker?: boolean;
}

export const slipAtom = atom<SlipSelection[]>([]);
export const stakeAtom = atom<string>('10');
/** The chosen bet type key; an accumulator unless a system bet is picked. */
export const betTypeAtom = atom<string>('accumulator');

export function toggleBanker(slip: SlipSelection[], fixtureId: string): SlipSelection[] {
  return slip.map((s) => (s.fixtureId === fixtureId ? { ...s, banker: !s.banker } : s));
}

/** One selection per fixture: an accumulator cannot carry two outcomes of the same match. */
export function toggleSelection(slip: SlipSelection[], selection: SlipSelection): SlipSelection[] {
  const same = slip.find((s) => s.fixtureId === selection.fixtureId);
  if (same && same.marketId === selection.marketId && same.selectionId === selection.selectionId) {
    return slip.filter((s) => s !== same);
  }
  return [...slip.filter((s) => s.fixtureId !== selection.fixtureId), selection];
}

export function totalOdds(slip: SlipSelection[]): number {
  return slip.reduce((product, s) => product * s.odds, 1);
}

/** Applies a live fixture snapshot to the slip: new prices are flagged, closed markets marked suspended. */
export function applyFixture(slip: SlipSelection[], fixture: Fixture): SlipSelection[] {
  let changed = false;
  const next = slip.map((s) => {
    if (s.fixtureId !== fixture.fixtureId) {
      return s;
    }
    const market = fixture.markets.find((m) => m.marketId === s.marketId);
    const selection = market?.selections.find((x) => x.selectionId === s.selectionId);
    const suspended = !market || market.status !== 'open' || fixture.status !== 'scheduled';
    if (!selection) {
      changed = true;
      return { ...s, suspended: true };
    }
    if (selection.odds === s.odds && suspended === !!s.suspended && fixture.offerVersion === s.offerVersion) {
      return s;
    }
    changed = true;
    return {
      ...s,
      odds: selection.odds,
      offerVersion: fixture.offerVersion,
      previousOdds: selection.odds !== s.odds ? (s.previousOdds ?? s.odds) : s.previousOdds,
      suspended,
    };
  });
  return changed ? next : slip;
}

export function acceptPrices(slip: SlipSelection[]): SlipSelection[] {
  return slip.map(({ previousOdds: _previous, ...rest }) => rest);
}
