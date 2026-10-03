export interface Money {
  minorUnits: number;
  currency: string;
}

export interface Selection {
  selectionId: string;
  name: string;
  odds: number;
}

export interface Market {
  marketId: string;
  type: string;
  status: 'open' | 'suspended' | 'settled' | string;
  selections: Selection[];
}

export interface Fixture {
  fixtureId: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  status: string;
  offerVersion: number;
  markets: Market[];
}

export interface MyCouponLeg {
  legId: string;
  fixtureId: string;
  marketId: string;
  selectionId: string;
  odds: number;
}

export interface MyCoupon {
  couponId: string;
  status: string;
  betType: 'single' | 'accumulator' | 'system' | null;
  stake: number | null;
  currency: string;
  totalOdds: number | null;
  potentialPayout: number | null;
  legs: MyCouponLeg[] | null;
  placedAt: string | null;
  settlementVersion: number;
  payout: number | null;
  paidToDate: number;
  updatedAt: string;
  /** Opaque keyset position; pass the last one as `before` for the next page. */
  cursor?: string | null;
}

export interface CouponDetailLeg extends MyCouponLeg {
  marketId: string;
  isBanker: boolean;
  /** won, lost or void; null while the result is not in. */
  result: string | null;
}

export interface SettlementEntry {
  version: number;
  outcome: string;
  payout: number;
  settledAt: string;
}

export interface CouponDetail extends Omit<MyCoupon, 'legs' | 'cursor'> {
  legs: CouponDetailLeg[];
  settlements: SettlementEntry[];
  cashout: { amount: number; cashedOutAt: string | null } | null;
  resultsAvailable: boolean;
}

export interface CatalogCompetition {
  competitionId: string;
  name: string;
  upcomingFixtures: number;
}

export interface CatalogSport {
  sportId: string;
  name: string;
  competitions: CatalogCompetition[];
}

export interface CashoutOffer {
  couponId: string;
  amount: number;
  currency: string;
  expiresAt: string;
  quoteToken: string;
}

export interface LiveDelta<T = unknown> {
  group: string;
  sequence: number;
  type: string;
  occurredAt: string;
  payload: T;
}
