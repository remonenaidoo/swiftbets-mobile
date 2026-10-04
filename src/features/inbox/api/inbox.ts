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
  event: 'bet-settled' | 'deposit-confirmed' | 'limit-reached' | 'self-exclusion' | 'identity-check';
  email: boolean;
  inApp: boolean;
  push: boolean;
  sms: boolean;
  locked: boolean;
}

/** Mobile number, quiet hours (South African time) and marketing consent; marketing is opt in on every channel. */
export interface ChannelSettings {
  mobile: string | null;
  quietStart: number | null;
  quietEnd: number | null;
  marketingEmail: boolean;
  marketingPush: boolean;
  marketingSms: boolean;
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
      api<void>(`/me/notification-preferences/${p.event}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: p.email, inApp: p.inApp, push: p.push, sms: p.sms }) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['me', 'notification-preferences'] }),
  });
}

const settingsKey = ['me', 'notification-settings'] as const;

export function useChannelSettings() {
  return useQuery({ queryKey: settingsKey, queryFn: () => api<ChannelSettings>('/me/notification-settings') });
}

export function useSetChannelSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (s: ChannelSettings) =>
      api<void>('/me/notification-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: settingsKey }),
  });
}

export interface PushDeviceBody {
  kind: 'web' | 'expo';
  endpoint: string;
  p256dh?: string;
  auth?: string;
}

export const registerPushDevice = (device: PushDeviceBody) =>
  api<{ deviceId: string }>('/me/push/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(device) });

export const removePushDevice = (endpoint: string) => api<void>(`/me/push/devices?endpoint=${encodeURIComponent(endpoint)}`, { method: 'DELETE' });

export const pushConfig = () => api<{ webPublicKey: string | null }>('/me/push/config');

/** Quiet hours from a "22" / "7" pair; both blank turns them off, one blank is not valid. */
export function parseQuietHours(start: string, end: string): { quietStart: number | null; quietEnd: number | null } | null {
  if (start.trim() === '' && end.trim() === '') {
    return { quietStart: null, quietEnd: null };
  }
  const hour = (v: string) => (/^\d{1,2}$/.test(v.trim()) && Number(v) <= 23 ? Number(v) : null);
  const s = hour(start);
  const e = hour(end);
  return s === null || e === null ? null : { quietStart: s, quietEnd: e };
}
