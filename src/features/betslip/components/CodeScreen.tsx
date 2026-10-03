import { Link } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { normalizeCode, useLoadCode } from '../api/bookingCodes';
import { slipSheetAtom } from '../state/slipSheet';
import { LoadedSummary } from './BookingCodePanel';

/** A shared link (/code/ABCD2345): loads the code into the slip once, then says what made it on. */
export function CodeScreen({ code }: { code: string }) {
  const wide = useIsWide();
  const normalized = normalizeCode(code);
  const load = useLoadCode();
  const openSheet = useSetAtom(slipSheetAtom);
  const started = useRef(false);
  const { mutate } = load;

  useEffect(() => {
    if (normalized && !started.current) {
      started.current = true;
      mutate(normalized, { onSuccess: (loaded) => loaded.selections.length > 0 && !wide && openSheet(true) });
    }
  }, [normalized, mutate, openSheet, wide]);

  if (!normalized || (load.isError && load.error instanceof ApiError && load.error.status === 404)) {
    return <EmptyState title="Code not found" message="That code does not exist or has expired. Codes last 7 days." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title} accessibilityRole="header">
        Booking code {normalized}
      </Text>
      {load.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {load.isError ? <EmptyState title="Could not load the code" message="Check your connection and try again." /> : null}
      {load.data ? (
        <View style={styles.card}>
          <LoadedSummary loaded={load.data} />
          {load.data.selections.length > 0 ? (
            wide ? (
              <Text style={styles.muted}>Your betslip on the right is ready. Check the stake and place it.</Text>
            ) : (
              <Pressable accessibilityRole="button" onPress={() => openSheet(true)} style={styles.button}>
                <Text style={styles.buttonText}>Open betslip</Text>
              </Pressable>
            )
          ) : null}
        </View>
      ) : null}
      <Link href="/coupon" style={styles.link}>
        Browse today&apos;s coupon ›
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  muted: { color: colors.textMuted, fontSize: 13 },
  button: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  link: { color: colors.text, fontWeight: '700', fontSize: 14 },
});
