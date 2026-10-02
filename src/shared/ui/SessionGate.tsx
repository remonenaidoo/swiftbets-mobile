import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../lib/useSession';
import { live } from '../realtime/live';
import { colors, spacing } from './theme';

/** Resolves the session before anything renders; live updates start once someone is signed in. */
export function SessionGate({ children }: { children: ReactNode }) {
  const session = useSession();

  useEffect(() => {
    if (session.data?.signedIn) {
      live.start();
    }
  }, [session.data?.signedIn]);

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
  link: { color: colors.odds, fontWeight: '600' },
});
