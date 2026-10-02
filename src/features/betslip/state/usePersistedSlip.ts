import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { persisted } from '../../../shared/lib/persisted';
import { slipAtom, stakeAtom, type SlipSelection } from './betslip';

const SlipKey = 'swiftbets.slip.v1';
const StakeKey = 'swiftbets.stake.v1';

/** Restores the slip once at start, then writes every change back; live deltas re-price anything that moved meanwhile. */
export function usePersistedSlip(): void {
  const [slip, setSlip] = useAtom(slipAtom);
  const [stake, setStake] = useAtom(stakeAtom);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([persisted.read<SlipSelection[]>(SlipKey), persisted.read<string>(StakeKey)]).then(([savedSlip, savedStake]) => {
      if (cancelled) {
        return;
      }
      if (Array.isArray(savedSlip)) {
        setSlip((current) => (current.length === 0 ? savedSlip : current));
      }
      if (typeof savedStake === 'string') {
        setStake(savedStake);
      }
      setRestored(true);
    });
    return () => {
      cancelled = true;
    };
  }, [setSlip, setStake]);

  useEffect(() => {
    if (restored) {
      void persisted.write(SlipKey, slip);
    }
  }, [restored, slip]);

  useEffect(() => {
    if (restored) {
      void persisted.write(StakeKey, stake);
    }
  }, [restored, stake]);
}
