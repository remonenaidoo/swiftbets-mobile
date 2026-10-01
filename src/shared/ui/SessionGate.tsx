import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ensurePunterSession } from '../lib/session';
import { live } from '../realtime/live';
import { colors, spacing } from './theme';

/** Opens a punter session (the demo punter on the preview) before anything renders; no sign-in form, ever. */
export function SessionGate({ children }: { children: ReactNode }) {
  const session = useQuery({ queryKey: ['session-ready'], queryFn: async () => (await ensurePunterSession(), true), staleTime: Infinity, retry: 2 });

  useEffect(() => {
    if (session.data) {
      live.start();
    }
  }, [session.data]);

  if (session.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (session.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Could not reach SwiftBets.</Text>
        <Pressable accessibilityRole="button" onPress={() => void session.refetch()}>
          <Text style={styles.link}>Try again</Text>
        </Pressable>
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface },
  text: { color: colors.text },
  link: { color: colors.accent, fontWeight: '600' },
});
