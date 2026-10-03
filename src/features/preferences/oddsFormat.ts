import { useQuery, useQueryClient } from '@tanstack/react-query';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { formatOddsAs, isOddsFormat, type OddsFormat } from '../../shared/lib/oddsFormat';
import { persisted } from '../../shared/lib/persisted';
import { api } from '../../shared/lib/session';
import { useSession } from '../../shared/lib/useSession';

const StorageKey = 'swiftbets.oddsFormat.v1';
const preferencesKey = ['me', 'preferences'] as const;

export const oddsFormatAtom = atom<OddsFormat>('decimal');

/**
 * Mounted once by the app frame. The device copy applies first so a visitor never sees a flash of the wrong format;
 * a signed-in customer's saved choice then wins, because it follows them across devices.
 */
export function useOddsFormatSync(): void {
  const setFormat = useSetAtom(oddsFormatAtom);
  const signedIn = useSession().data?.signedIn === true;
  const saved = useQuery({
    queryKey: preferencesKey,
    queryFn: () => api<{ oddsFormat: string }>('/profile/preferences'),
    enabled: signedIn,
    staleTime: Infinity,
  });

  useEffect(() => {
    void persisted.read<string>(StorageKey).then((local) => {
      if (isOddsFormat(local)) {
        setFormat(local);
      }
    });
  }, [setFormat]);

  useEffect(() => {
    const format = saved.data?.oddsFormat;
    if (signedIn && isOddsFormat(format)) {
      setFormat(format);
      void persisted.write(StorageKey, format);
    }
  }, [signedIn, saved.data, setFormat]);
}

/** Changes the format at once, keeps it on the device and, when signed in, on the account. */
export function useSetOddsFormat(): (format: OddsFormat) => void {
  const setFormat = useSetAtom(oddsFormatAtom);
  const signedIn = useSession().data?.signedIn === true;
  const queryClient = useQueryClient();
  return useCallback(
    (format: OddsFormat) => {
      setFormat(format);
      void persisted.write(StorageKey, format);
      if (signedIn) {
        queryClient.setQueryData(preferencesKey, { oddsFormat: format });
        void api('/profile/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oddsFormat: format }) }).catch(() => undefined);
      }
    },
    [setFormat, signedIn, queryClient],
  );
}

/** Formats decimal odds the way this visitor chose. */
export function useFormatOdds(): (odds: number) => string {
  const format = useAtomValue(oddsFormatAtom);
  return useCallback((odds: number) => formatOddsAs(odds, format), [format]);
}
