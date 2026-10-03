export type StatusFilter = 'open' | 'won' | 'lost' | 'void' | 'cashedOut' | 'all';
export type BetTypeFilter = 'all' | 'single' | 'accumulator' | 'system';
export type RangeFilter = 'all' | 'today' | '7d' | '30d' | '90d';

export interface BetFilter {
  status: StatusFilter;
  betType: BetTypeFilter;
  range: RangeFilter;
}

export const pageSize = 20;

const days: Record<Exclude<RangeFilter, 'all' | 'today'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

/** The start of the range: local midnight today, or that many days back from now. */
export function rangeStart(range: RangeFilter, now: Date = new Date()): Date | null {
  if (range === 'all') {
    return null;
  }
  if (range === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  return new Date(now.getTime() - days[range] * 86_400_000);
}

/** bet-history's query for one page of the filter; `before` is the previous page's last cursor. */
export function historyQuery(filter: BetFilter, before?: string, now: Date = new Date()): string {
  const params = new URLSearchParams({ limit: String(pageSize) });
  if (filter.status !== 'all') {
    params.set('status', filter.status);
  }
  if (filter.betType !== 'all') {
    params.set('betType', filter.betType);
  }
  const from = rangeStart(filter.range, now);
  if (from) {
    params.set('from', from.toISOString());
  }
  if (before) {
    params.set('before', before);
  }
  return `/me/coupons?${params.toString()}`;
}
