import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from './theme';

export const toastAtom = atom<string | null>(null);

/** A short confirmation that outlives the sheet or panel that raised it. */
export function Toast() {
  const [message, setMessage] = useAtom(toastAtom);

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(() => setMessage(null), 4_000);
    return () => clearTimeout(timer);
  }, [message, setMessage]);

  if (!message) {
    return null;
  }
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 72, left: 0, right: 0, alignItems: 'center', paddingHorizontal: spacing.md },
  toast: {
    backgroundColor: colors.positive,
    color: '#04210f',
    fontWeight: '700',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
