import { useAtom } from 'jotai';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { slipSheetAtom } from '../state/slipSheet';
import { Betslip } from './Betslip';

/** Phones: the betslip slides up as a sheet from the bottom bar's Betslip button. */
export function BetslipSheet() {
  const [open, setOpen] = useAtom(slipSheetAtom);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
      <Pressable style={styles.backdrop} accessibilityLabel="Close betslip" onPress={() => setOpen(false)} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={styles.handle} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <Betslip onPlaced={() => setOpen(false)} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000aa' },
  sheet: { maxHeight: '85%', backgroundColor: colors.surfaceRaised, borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4, borderTopWidth: 1, borderColor: colors.border },
  handle: { width: 40, height: 4, borderRadius: 4, backgroundColor: colors.border, alignSelf: 'center', marginVertical: spacing.sm },
});
