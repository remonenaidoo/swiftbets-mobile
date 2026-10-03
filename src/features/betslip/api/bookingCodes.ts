import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { Share } from 'react-native';
import { brandName } from '../../../shared/brand';
import { apiOrigin, isWeb } from '../../../shared/lib/config';
import { api } from '../../../shared/lib/session';
import { marketLabel } from '../../fixtures/components/marketLabel';
import { slipAtom, stakeAtom, type SlipSelection } from '../state/betslip';

export interface SavedCode {
  code: string;
  expiresAt: string;
}

interface LoadedSelection {
  fixtureId: string;
  fixtureName: string;
  marketId: string;
  marketType: string;
  selectionId: string;
  selectionName: string;
  odds: number;
  offerVersion: number;
}

export interface SkippedSelection {
  fixtureName: string;
  marketType: string;
  selectionName: string;
}

export interface LoadedCode {
  code: string;
  stake: number | null;
  selections: LoadedSelection[];
  skipped: SkippedSelection[];
  expiresAt: string;
}

/** Codes use upper case letters and digits without 0, O, 1, I or L, so a typed or read-aloud code survives. */
export function normalizeCode(input: string): string | null {
  const code = input.trim().toUpperCase();
  return /^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{8}$/.test(code) ? code : null;
}

export function shareLink(code: string): string {
  const origin = isWeb ? (globalThis.location?.origin ?? '') : apiOrigin;
  return `${origin}/code/${code}`;
}

/** Puts the link on the clipboard on the web, or opens the share sheet in the app. */
export async function shareCode(code: string): Promise<'copied' | 'shared' | 'failed'> {
  const link = shareLink(code);
  try {
    if (isWeb) {
      await globalThis.navigator?.clipboard?.writeText(link);
      return 'copied';
    }
    await Share.share({ message: `My ${brandName} slip: ${link} (code ${code})` });
    return 'shared';
  } catch {
    return 'failed';
  }
}

export function toSlip(selections: LoadedSelection[]): SlipSelection[] {
  return selections.map((s) => ({
    fixtureId: s.fixtureId,
    fixtureName: s.fixtureName,
    marketId: s.marketId,
    marketName: marketLabel(s.marketType),
    selectionId: s.selectionId,
    selectionName: s.selectionName,
    odds: s.odds,
    offerVersion: s.offerVersion,
  }));
}

/** Saves the slip's selections (and the stake, when one is set) under a new code. */
export function useSaveCode() {
  return useMutation({
    mutationFn: ({ slip, stakeMinor }: { slip: SlipSelection[]; stakeMinor: number | null }) =>
      api<SavedCode>('/booking-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legs: slip.map((s) => ({ fixtureId: s.fixtureId, marketId: s.marketId, selectionId: s.selectionId })), stake: stakeMinor }),
      }),
  });
}

/** Loads a code into the slip at today's prices, replacing what was there; closed selections come back named, not added. */
export function useLoadCode() {
  const setSlip = useSetAtom(slipAtom);
  const setStake = useSetAtom(stakeAtom);
  return useMutation({
    mutationFn: (code: string) => api<LoadedCode>(`/booking-codes/${encodeURIComponent(code)}`),
    onSuccess: (loaded) => {
      if (loaded.selections.length > 0) {
        setSlip(toSlip(loaded.selections));
      }
      if (loaded.stake) {
        setStake(String(loaded.stake / 100));
      }
    },
  });
}

export function skippedLabel(s: SkippedSelection): string {
  return `${s.selectionName} (${marketLabel(s.marketType)}, ${s.fixtureName})`;
}
