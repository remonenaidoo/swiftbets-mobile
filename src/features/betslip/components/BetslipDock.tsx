import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatOdds } from '../../../shared/lib/format';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { slipAtom, totalOdds } from '../state/betslip';
import { Betslip } from './Betslip';

/** Narrow screens: a bar pinned to the bottom that opens the betslip as a sheet. */
export function BetslipDock() {
  const slip = useAtomValue(slipAtom);
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  if (slip.length === 0 && !open) {
    return null;
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open betslip, ${slip.length} selections`}
        onPress={() => setOpen(true)}
        style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.sm }]}
      >
        <View style={styles.count}>
          <Text style={styles.countText}>{slip.length}</Text>
        </View>
        <Text style={styles.barText}>Betslip</Text>
        <Text style={styles.barOdds}>@ {formatOdds(totalOdds(slip))}</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} accessibilityLabel="Close betslip" onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          <View style={styles.handle} />
          <ScrollView keyboardShouldPersistTaps="handled">
            <Betslip onPlaced={() => setOpen(false)} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.accentStrong,
  },
  count: { minWidth: 26, height: 26, borderRadius: 13, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: colors.accentStrong, fontWeight: '800' },
  barText: { color: '#ffffff', fontWeight: '700', fontSize: 16, flex: 1 },
  barOdds: { color: '#ffffff', fontWeight: '700', fontSize: 16, fontVariant: ['tabular-nums'] },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { backgroundColor: colors.surfaceRaised, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, maxHeight: '85%' },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginTop: spacing.sm },
});
