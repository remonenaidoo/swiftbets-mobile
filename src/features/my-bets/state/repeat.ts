import type { Fixture, MyCouponLeg } from '../../../shared/lib/types';
import type { SlipSelection } from '../../betslip/state/betslip';
import { marketLabel } from '../../fixtures/components/marketLabel';

export interface RepeatResult {
  selections: SlipSelection[];
  /** Readable names of the legs that could not go back on the slip. */
  skipped: string[];
}

/** The bet's legs at today's prices; a leg whose match, market or selection is no longer open is skipped. */
export function repeatSelections(legs: MyCouponLeg[], fixtures: Map<string, Fixture>): RepeatResult {
  const selections: SlipSelection[] = [];
  const skipped: string[] = [];
  for (const leg of legs) {
    const fixture = fixtures.get(leg.fixtureId);
    const market = fixture?.markets.find((m) => m.marketId === leg.marketId);
    const selection = market?.selections.find((s) => s.selectionId === leg.selectionId);
    const fixtureName = fixture ? `${fixture.homeTeam} v ${fixture.awayTeam}` : leg.fixtureId;
    if (!fixture || !market || !selection || fixture.status !== 'scheduled' || market.status !== 'open' || selections.some((s) => s.fixtureId === leg.fixtureId)) {
      skipped.push(selection ? `${selection.name} (${fixtureName})` : fixtureName);
      continue;
    }
    selections.push({
      fixtureId: fixture.fixtureId,
      fixtureName,
      marketId: market.marketId,
      marketName: marketLabel(market.type),
      selectionId: selection.selectionId,
      selectionName: selection.name,
      odds: selection.odds,
      offerVersion: fixture.offerVersion,
    });
  }
  return { selections, skipped };
}

/** What the customer is told once the slip is filled. */
export function repeatMessage(result: RepeatResult): string {
  if (result.selections.length === 0) {
    return 'None of these selections are open any more.';
  }
  const added = `${result.selections.length} selection${result.selections.length === 1 ? '' : 's'} added at today's prices.`;
  return result.skipped.length === 0 ? added : `${added} Skipped, no longer open: ${result.skipped.join(', ')}.`;
}
