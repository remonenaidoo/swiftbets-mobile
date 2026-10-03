/** How prices are shown. Display only: slips and coupons always carry decimal odds. */
export type OddsFormat = 'decimal' | 'fractional' | 'american';

export const oddsFormats: { key: OddsFormat; label: string; example: string }[] = [
  { key: 'decimal', label: 'Decimal', example: '2.50' },
  { key: 'fractional', label: 'Fractional', example: '3/2' },
  { key: 'american', label: 'American', example: '+150' },
];

export function isOddsFormat(value: unknown): value is OddsFormat {
  return value === 'decimal' || value === 'fractional' || value === 'american';
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** The simplest bookmaker-style fraction within half a cent of the decimal price's profit (2.10 is 11/10, 1.80 is 4/5). */
function toFraction(odds: number): string {
  const profit = odds - 1;
  if (Math.abs(profit - 1) < 0.005) {
    return 'Evens';
  }
  for (const den of [1, 2, 3, 4, 5, 6, 8, 10, 11, 13, 15, 20, 25, 40, 50, 100]) {
    const num = Math.round(profit * den);
    if (num > 0 && Math.abs(num / den - profit) < 0.005) {
      const d = gcd(num, den);
      return `${num / d}/${den / d}`;
    }
  }
  const num = Math.round(profit * 100);
  const d = gcd(num, 100);
  return `${num / d}/${100 / d}`;
}

export function formatOddsAs(odds: number, format: OddsFormat): string {
  if (!Number.isFinite(odds) || odds <= 1) {
    return odds.toFixed(2);
  }
  switch (format) {
    case 'fractional':
      return toFraction(odds);
    case 'american':
      return odds >= 2 ? `+${Math.round((odds - 1) * 100)}` : `-${Math.round(100 / (odds - 1))}`;
    default:
      return odds.toFixed(2);
  }
}
