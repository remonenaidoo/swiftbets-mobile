import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, spacing } from '../../../shared/ui/theme';

export function FixturesScreen() {
  return (
    <View style={styles.screen}>
      <EmptyState title="No fixtures yet" message="Upcoming matches and odds appear here once the offer feed is running." />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface, padding: spacing.md, justifyContent: 'center' },
});
