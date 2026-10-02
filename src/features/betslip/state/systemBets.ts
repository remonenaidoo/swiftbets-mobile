/** Bet types over a slip, mirroring placement's SystemBets: folds are line sizes over the non-banker selections. */
export interface BetType {
  key: string;
  label: string;
  /** Absent for the plain single or accumulator, which places one line over every selection. */
  folds?: number[];
}

const named: { key: string; label: string; selections: number; folds: number[] }[] = [
  { key: 'trixie', label: 'Trixie', selections: 3, folds: [2, 3] },
  { key: 'patent', label: 'Patent', selections: 3, folds: [1, 2, 3] },
  { key: 'yankee', label: 'Yankee', selections: 4, folds: [2, 3, 4] },
  { key: 'lucky15', label: 'Lucky 15', selections: 4, folds: [1, 2, 3, 4] },
  { key: 'canadian', label: 'Canadian', selections: 5, folds: [2, 3, 4, 5] },
  { key: 'lucky31', label: 'Lucky 31', selections: 5, folds: [1, 2, 3, 4, 5] },
  { key: 'heinz', label: 'Heinz', selections: 6, folds: [2, 3, 4, 5, 6] },
  { key: 'lucky63', label: 'Lucky 63', selections: 6, folds: [1, 2, 3, 4, 5, 6] },
  { key: 'superHeinz', label: 'Super Heinz', selections: 7, folds: [2, 3, 4, 5, 6, 7] },
  { key: 'goliath', label: 'Goliath', selections: 8, folds: [2, 3, 4, 5, 6, 7, 8] },
];

/** What a slip with this many non-banker selections can be placed as; the accumulator comes first. */
export function betTypes(selections: number, bankers = 0): BetType[] {
  const total = selections + bankers;
  const plain: BetType = { key: 'accumulator', label: total === 1 ? 'Single' : `Accumulator (${total})` };
  if (selections < 3) return [plain];
  return [
    plain,
    { key: 'doubles', label: 'Doubles', folds: [2] },
    ...(selections >= 4 ? [{ key: 'trebles', label: 'Trebles', folds: [3] }] : []),
    ...named.filter((n) => n.selections === selections).map(({ key, label, folds }) => ({ key, label, folds })),
  ];
}

function choose(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return Math.round(result);
}

export function lineCount(selections: number, folds: number[]): number {
  return folds.reduce((sum, k) => sum + choose(selections, k), 0);
}

/** What one line pays, exactly as placement does: stake times the product of its odds, rounded down to the cent. */
export function linePayoutMinor(stakeMinor: number, odds: number[]): number {
  const cents = odds.map((o) => BigInt(Math.round(o * 100)));
  const scale = 100n ** BigInt(cents.length);
  return Number((BigInt(stakeMinor) * cents.reduce((p, c) => p * c, 1n)) / scale);
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  return items.flatMap((item, i) => combinations(items.slice(i + 1), size - 1).map((rest) => [item, ...rest]));
}

/** Most a system bet can return when every selection wins: each line (with every banker) paid and rounded as placement does. */
export function maxReturnMinor(unitStakeMinor: number, odds: number[], folds: number[], bankerOdds: number[] = []): number {
  return folds.reduce((sum, k) => sum + combinations(odds, k).reduce((lines, line) => lines + linePayoutMinor(unitStakeMinor, [...bankerOdds, ...line]), 0), 0);
}
