export interface Money {
  minorUnits: number;
  currency: string;
}

export interface OddsBoost {
  odds: number;
  from: string;
  until: string;
  maxStake: number;
}

export interface Selection {
  selectionId: string;
  name: string;
  odds: number;
  /** A trader's boosted price, present only while it is in its window. */
  boost?: OddsBoost | null;
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
  /** True when the competition offers the bet builder. */
  betBuilder?: boolean;
}

export interface BuilderComponent {
  marketId: string;
  selectionId: string;
  odds: number;
}

export interface MyCouponLeg {
  legId: string;
  fixtureId: string;
  marketId: string;
  selectionId: string;
  odds: number;
  builder?: { components: BuilderComponent[] } | null;
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
  accaBoostPercent?: number | null;
  boostBonus?: number | null;
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
