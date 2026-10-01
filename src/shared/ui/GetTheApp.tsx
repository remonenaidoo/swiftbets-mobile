import { Linking, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from './theme';

export const apkUrl = 'https://github.com/remonenaidoo/swiftbets-mobile/releases/latest/download/swiftbets.apk';

/** Web only: the same app as a signed Android download. */
export function GetTheApp() {
  if (Platform.OS !== 'web') {
    return null;
  }
  return (
    <Pressable accessibilityRole="link" accessibilityLabel="Download the Android app" onPress={() => void Linking.openURL(apkUrl)} style={styles.button}>
      <Text style={styles.text}>Get the Android app</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderWidth: 1, borderColor: colors.accent, borderRadius: radius.md, paddingVertical: 6, paddingHorizontal: 10 },
  text: { color: colors.accent, fontWeight: '600', fontSize: 13 },
});
