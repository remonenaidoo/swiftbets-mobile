import { useQuery } from '@tanstack/react-query';
import { loadSession } from './session';

export const sessionQueryKey = ['session'] as const;

export function useSession() {
  return useQuery({ queryKey: sessionQueryKey, queryFn: loadSession, staleTime: Infinity, retry: 2 });
}
