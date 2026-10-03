import { useAtomValue } from 'jotai';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { oddsFormats } from '../../../shared/lib/oddsFormat';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { oddsFormatAtom, useSetOddsFormat } from '../oddsFormat';

/** Decimal, fractional or american prices, for everyone; saved to the account when signed in. */
export function OddsFormatPicker({ compact = false }: { compact?: boolean }) {
  const format = useAtomValue(oddsFormatAtom);
  const setFormat = useSetOddsFormat();
  return (
    <View style={styles.wrap}>
      {compact ? null : <Text style={styles.label} nativeID="odds-format-label">Odds format</Text>}
      <View style={styles.group} role="radiogroup" aria-labelledby={compact ? undefined : 'odds-format-label'} aria-label={compact ? 'Odds format' : undefined}>
        {oddsFormats.map((f) => (
          <Pressable key={f.key} role="radio" aria-checked={format === f.key} onPress={() => setFormat(f.key)} style={[styles.option, format === f.key && styles.optionOn]}>
            <Text style={[styles.optionText, format === f.key && styles.optionTextOn]}>{compact ? f.example : f.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  group: { flexDirection: 'row', backgroundColor: colors.surfaceSunken, borderRadius: radius.pill, padding: 3, gap: 2 },
  option: { flex: 1, alignItems: 'center', paddingVertical: 7, paddingHorizontal: 8, borderRadius: radius.pill },
  optionOn: { backgroundColor: colors.accent },
  optionText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  optionTextOn: { color: '#ffffff' },
});
