import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { CatalogSport } from '../../../shared/lib/types';

export function useSports() {
  return useQuery({ queryKey: ['catalog', 'sports'], queryFn: () => api<CatalogSport[]>('/catalog/sports'), staleTime: 60_000 });
}
