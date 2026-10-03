import { unreadCount, type InboxItem } from './api/inbox';

const item = (readAt: string | null): InboxItem => ({ messageId: Math.random().toString(), category: 'bet-settled', title: 't', body: 'b', createdAt: '2026-10-03T09:00:00Z', readAt });

describe('unreadCount', () => {
  it('counts only the messages not yet opened', () => {
    expect(unreadCount([item(null), item('2026-10-03T09:05:00Z'), item(null)])).toBe(2);
  });

  it('is zero before the inbox has loaded', () => {
    expect(unreadCount(undefined)).toBe(0);
  });
});
