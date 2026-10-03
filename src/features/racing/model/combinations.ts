// Tote combination counts, the same rules the racing service applies; the server stays authoritative.

export type PoolType = 'win' | 'place' | 'swinger' | 'exacta' | 'trifecta' | 'quartet' | 'dailyDouble' | 'jackpot' | 'pick6' | 'placeAccumulator';
export type EntryMode = 'straight' | 'box' | 'banker' | 'floating';

export const minUnitStake = 50;
export const maxCombinations = 10_000;

const positionCount: Partial<Record<PoolType, number>> = { win: 1, place: 1, swinger: 2, exacta: 2, trifecta: 3, quartet: 4 };
const legCount: Partial<Record<PoolType, number>> = { dailyDouble: 2, jackpot: 4, pick6: 6, placeAccumulator: 6 };

const poolLabels: Record<PoolType, string> = {
  win: 'Win',
  place: 'Place',
  swinger: 'Swinger',
  exacta: 'Exacta',
  trifecta: 'Trifecta',
  quartet: 'Quartet',
  dailyDouble: 'Daily Double',
  jackpot: 'Jackpot',
  pick6: 'Pick 6',
  placeAccumulator: 'Place Accumulator',
};

export function poolLabel(type: PoolType): string {
  return poolLabels[type] ?? type;
}

/** Legs in a multi-leg pool, or 0 for a single-race pool. */
export function legsOf(type: PoolType): number {
  return legCount[type] ?? 0;
}

export function positionsOf(type: PoolType): number {
  return positionCount[type] ?? 0;
}

/** The entry modes a pool accepts. */
export function modesFor(type: PoolType): EntryMode[] {
  if (type === 'swinger') {
    return ['straight', 'banker'];
  }
  if (type === 'exacta' || type === 'trifecta' || type === 'quartet') {
    return ['straight', 'box', 'banker', 'floating'];
  }
  return ['straight'];
}

export function modeLabel(type: PoolType, mode: EntryMode): string {
  switch (mode) {
    case 'box':
      return `Boxed ${poolLabel(type)}`;
    case 'banker':
      return 'Banker';
    case 'floating':
      return 'Floating banker';
    default:
      return 'Straight';
  }
}

/** The rows of runners the builder shows, with a label for each. */
export function rowsFor(type: PoolType, mode: EntryMode): string[] {
  const legs = legsOf(type);
  if (legs > 0) {
    return Array.from({ length: legs }, (_, i) => `Leg ${i + 1}`);
  }
  if (mode === 'banker' || mode === 'floating') {
    return [type === 'swinger' ? 'Banker' : 'Bankers', 'With'];
  }
  const n = positionsOf(type);
  if (mode === 'straight' && type !== 'swinger' && n > 1) {
    return ['1st', '2nd', '3rd', '4th'].slice(0, n);
  }
  return ['Runners'];
}

function perm(n: number, k: number): number {
  if (k < 0 || k > n) {
    return 0;
  }
  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= n - i;
  }
  return result;
}

function unique(list: number[] | undefined): number[] {
  return [...new Set(list ?? [])];
}

function distinctTuples(lists: number[][], used: Set<number> = new Set(), at = 0): number {
  if (at === lists.length) {
    return 1;
  }
  let total = 0;
  for (const runner of lists[at]!) {
    if (!used.has(runner)) {
      used.add(runner);
      total += distinctTuples(lists, used, at + 1);
      used.delete(runner);
    }
  }
  return total;
}

/** How many combinations an entry covers; 0 when the entry is incomplete or not allowed. */
export function combinations(type: PoolType, mode: EntryMode, selections: number[][]): number {
  if (!modesFor(type).includes(mode)) {
    return 0;
  }
  const legs = legsOf(type);
  if (legs > 0) {
    return selections.length === legs ? selections.reduce((total, leg) => total * unique(leg).length, 1) : 0;
  }
  const n = positionsOf(type);
  if (n === 1) {
    return selections.length === 1 ? unique(selections[0]).length : 0;
  }
  if (type === 'swinger') {
    if (mode === 'straight') {
      const k = selections.length === 1 ? unique(selections[0]).length : 0;
      return (k * (k - 1)) / 2;
    }
    const banker = unique(selections[0]);
    return selections.length === 2 && banker.length === 1 ? unique(selections[1]).filter((r) => r !== banker[0]).length : 0;
  }
  if (mode === 'straight') {
    return selections.length === n ? distinctTuples(selections.map(unique)) : 0;
  }
  if (mode === 'box') {
    return selections.length === 1 ? perm(unique(selections[0]).length, n) : 0;
  }
  if (selections.length !== 2) {
    return 0;
  }
  const bankers = unique(selections[0]);
  const b = bankers.length;
  if (b < 1 || b >= n) {
    return 0;
  }
  const m = unique(selections[1]).filter((r) => !bankers.includes(r)).length;
  return mode === 'banker' ? perm(m, n - b) : perm(n, b) * perm(m, n - b);
}

/** Why an entry cannot be submitted yet, or null when it can. */
export function entryProblem(count: number, unitStakeMinor: number): string | null {
  if (count === 0) {
    return 'Pick runners for every row.';
  }
  if (count > maxCombinations) {
    return `Too many combinations. The limit is ${maxCombinations}.`;
  }
  if (!Number.isInteger(unitStakeMinor) || unitStakeMinor < minUnitStake) {
    return 'The minimum unit stake is R0.50.';
  }
  return null;
}
