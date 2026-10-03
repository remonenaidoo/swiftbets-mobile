import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import { useLiveInvalidation } from '../../../shared/realtime/useLive';
import { useSession } from '../../../shared/lib/useSession';

export interface InboxItem {
  messageId: string;
  category: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface Preference {
  event: 'bet-settled' | 'deposit-confirmed' | 'limit-reached' | 'self-exclusion';
  email: boolean;
  inApp: boolean;
  locked: boolean;
}

const inboxKey = ['me', 'inbox'] as const;

/** The customer's inbox; a new message pushed over the live connection refreshes it at once. */
export function useInbox() {
  useLiveInvalidation(['inbox-message'], inboxKey);
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: inboxKey, queryFn: () => api<InboxItem[]>('/me/inbox?limit=50'), enabled: signedIn });
}

export const unreadCount = (items: InboxItem[] | undefined) => (items ?? []).filter((i) => i.readAt === null).length;

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => api<void>(`/me/inbox/${messageId}/read`, { method: 'POST' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: inboxKey }),
  });
}

export function usePreferences() {
  return useQuery({ queryKey: ['me', 'notification-preferences'], queryFn: () => api<Preference[]>('/me/notification-preferences') });
}

export function useSetPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: Preference) =>
      api<void>(`/me/notification-preferences/${p.event}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: p.email, inApp: p.inApp }) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['me', 'notification-preferences'] }),
  });
}
