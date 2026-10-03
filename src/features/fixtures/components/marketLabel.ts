import type { Market } from '../../../shared/lib/types';

const labels: Record<string, string> = {
  matchResult: 'Match result',
  totalGoalsOverUnder25: 'Total goals 2.5',
  matchWinner: 'Match winner',
  setHandicap: 'Set handicap',
  totalGames: 'Total games',
  handicap: 'Handicap',
  totalPoints: 'Total points',
  topBatter: 'Top batter',
  competitionWinner: 'Outright winner',
};
const basketball: Record<string, string> = { matchWinner: 'Moneyline', handicap: 'Spread' };
const withLine = new Set(['totalGames', 'totalPoints']);

/** The market's line: on the market when sent, otherwise read from a selection id such as "over:22.5". */
function lineOf(market: Pick<Market, 'line' | 'selections'>): number | null {
  if (market.line !== undefined && market.line !== null) return market.line;
  const fromId = Number((market.selections?.[0]?.selectionId ?? '').split(':')[1]);
  return Number.isFinite(fromId) && fromId !== 0 ? Math.abs(fromId) : null;
}

/** A market's display name; some differ by sport, and totals carry their line. */
export function marketLabel(market: Pick<Market, 'type' | 'line' | 'selections'>, sport = 'soccer'): string {
  const base = (sport === 'basketball' ? basketball[market.type] : undefined) ?? labels[market.type] ?? market.type.replace(/([a-z])([A-Z])/g, '$1 $2');
  const line = withLine.has(market.type) ? lineOf(market) : null;
  return line === null ? base : `${base} ${line}`;
}
