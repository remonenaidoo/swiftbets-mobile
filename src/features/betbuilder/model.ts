export interface BuilderPick {
  marketId: string;
  selectionId: string;
  name: string;
}

/** One pick per market: tapping the picked selection removes it, tapping another in the same market replaces it. */
export function togglePick(picks: BuilderPick[], pick: BuilderPick): BuilderPick[] {
  const same = picks.find((p) => p.marketId === pick.marketId);
  if (same?.selectionId === pick.selectionId) {
    return picks.filter((p) => p !== same);
  }
  return [...picks.filter((p) => p.marketId !== pick.marketId), pick];
}

export interface AccaBoostTable {
  tiers: { legs: number; percent: number }[];
  minLegOdds: number;
}

/** The accumulator boost percent a slip earns: the highest tier its leg count reaches, with every leg at the minimum price. */
export function accaBoostPercent(table: AccaBoostTable | undefined, legOdds: number[]): number {
  if (!table || legOdds.length < 2 || legOdds.some((o) => o < table.minLegOdds)) {
    return 0;
  }
  return table.tiers.filter((t) => t.legs <= legOdds.length).reduce((best, t) => (t.legs > best.legs ? t : best), { legs: 0, percent: 0 }).percent;
}

/** The boost on the winnings, rounded down to the cent. */
export function accaBonusMinor(stakeMinor: number, returnMinor: number, percent: number): number {
  return returnMinor <= stakeMinor || percent <= 0 ? 0 : Math.floor(((returnMinor - stakeMinor) * percent) / 100);
}
