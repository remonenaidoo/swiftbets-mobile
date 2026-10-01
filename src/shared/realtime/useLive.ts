import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import type { LiveDelta } from '../lib/types';
import { live } from './live';

export function useDeltas(types: readonly string[], handler: (delta: LiveDelta) => void): void {
  const handlerRef = useRef(handler);
  const key = types.join('|');
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    const wanted = new Set(key.split('|'));
    return live.onDelta((delta) => {
      if (wanted.has(delta.type)) {
        handlerRef.current(delta);
      }
    });
  }, [key]);
}

/** Re-reads a query whenever one of these deltas arrives, or the live stream reports a gap. */
export function useLiveInvalidation(types: readonly string[], queryKey: readonly unknown[]): void {
  const queryClient = useQueryClient();
  const serialised = JSON.stringify(queryKey);
  useDeltas(types, () => void queryClient.invalidateQueries({ queryKey: JSON.parse(serialised) as unknown[] }));
  useEffect(() => live.onResync(() => void queryClient.invalidateQueries({ queryKey: JSON.parse(serialised) as unknown[] })), [queryClient, serialised]);
}
