import { atom } from 'jotai';
import type { Race } from '../api/racing';

export interface RacingPick {
  raceId: string;
  raceLabel: string;
  runner: number;
  runnerName: string;
  market: 'win' | 'place';
  priceType: 'fixed' | 'sp';
  price: number | null;
  /** The price before a move, while the customer has not accepted the new one. */
  previousPrice?: number;
  stake: string;
}

export const racingSlipAtom = atom<RacingPick[]>([]);

const same = (a: RacingPick, b: { raceId: string; runner: number; market: string }) => a.raceId === b.raceId && a.runner === b.runner && a.market === b.market;

/** Tapping a price adds it, tapping it again removes it. */
export function togglePick(slip: RacingPick[], pick: RacingPick): RacingPick[] {
  return slip.some((p) => same(p, pick)) ? slip.filter((p) => !same(p, pick)) : [...slip, pick];
}

/** Applies the race card's current price to a pick after a price_changed refusal; unchanged when the price did not move. */
export function repricePick(slip: RacingPick[], pick: RacingPick, race: Race): RacingPick[] {
  const runner = race.runners.find((r) => r.number === pick.runner);
  const current = pick.market === 'win' ? runner?.winPrice : runner?.placePrice;
  if (current == null || current === pick.price) {
    return slip;
  }
  return slip.map((p) => (same(p, pick) ? { ...p, previousPrice: p.price ?? undefined, price: current } : p));
}

export function acceptPick(slip: RacingPick[], pick: RacingPick): RacingPick[] {
  return slip.map((p) => (same(p, pick) ? { ...p, previousPrice: undefined } : p));
}

export function stakeMinor(stake: string): number {
  return Math.round((Number.parseFloat(stake.replace(',', '.')) || 0) * 100);
}
