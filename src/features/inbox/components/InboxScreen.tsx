import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { useInbox, useMarkRead } from '../api/inbox';

const when = (iso: string) => new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Messages about the customer's bets, deposits, limits and breaks, newest first; opening one marks it read. */
export function InboxScreen() {
  const inbox = useInbox();
  const markRead = useMarkRead();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          Inbox
        </Text>
        <Link href={'/notifications' as never} style={styles.settings}>
          Settings
        </Link>
      </View>
      {inbox.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {inbox.isError ? <EmptyState title="Messages could not load" message="Check your connection and try again." /> : null}
      {inbox.isSuccess && inbox.data.length === 0 ? <EmptyState title="No messages yet" message="We'll tell you here when a bet settles or a deposit lands." /> : null}
      {inbox.data?.map((m) => (
        <Pressable
          key={m.messageId}
          accessibilityRole="button"
          accessibilityLabel={`${m.readAt ? '' : 'Unread: '}${m.title}`}
          onPress={() => (m.readAt ? undefined : markRead.mutate(m.messageId))}
          style={[styles.item, m.readAt === null && styles.unread]}
        >
          <View style={styles.itemHead}>
            <Text style={styles.itemTitle}>{m.title}</Text>
            <Text style={styles.time}>{when(m.createdAt)}</Text>
          </View>
          <Text style={styles.body}>{m.body}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40, maxWidth: 760, width: '100%', alignSelf: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  settings: { color: colors.odds, fontWeight: '700', fontSize: 14 },
  item: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, gap: 4, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  unread: { borderLeftColor: colors.accent },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  itemTitle: { color: colors.text, fontWeight: '800', fontSize: 15, flexShrink: 1 },
  time: { color: colors.textMuted, fontSize: 12 },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});
