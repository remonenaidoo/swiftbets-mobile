import type { MyCoupon } from '../../shared/lib/types';
import { secondsLeft } from './api/cashout';
import { canCashOut } from './components/CashoutPanel';

const coupon = (over: Partial<MyCoupon>): MyCoupon => ({
  couponId: 'c1',
  status: 'open',
  betType: 'single',
  stake: 1_000,
  currency: 'ZAR',
  totalOdds: 2,
  potentialPayout: 2_000,
  legs: [],
  placedAt: '2026-10-02T10:00:00Z',
  settlementVersion: 0,
  payout: null,
  paidToDate: 0,
  updatedAt: '2026-10-02T10:00:00Z',
  ...over,
});

describe('cashout', () => {
  it('offers cashout on open singles and accumulators', () => {
    expect([canCashOut(coupon({})), canCashOut(coupon({ betType: 'accumulator' }))]).toEqual([true, true]);
  });

  it('never offers it on system bets or settled coupons', () => {
    expect([canCashOut(coupon({ betType: 'system' })), canCashOut(coupon({ status: 'won' }))]).toEqual([false, false]);
  });

  it('counts a quote down to zero and no further', () => {
    const offer = { couponId: 'c1', amount: 1_500, currency: 'ZAR', expiresAt: '2026-10-02T12:00:10Z', quoteToken: 't' };
    expect([secondsLeft(offer, Date.parse('2026-10-02T12:00:02Z')), secondsLeft(offer, Date.parse('2026-10-02T12:00:30Z'))]).toEqual([8, 0]);
  });
});
