import { Link } from 'expo-router';
import { Pressable, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { isSitePath, openSite } from '../lib/links';

/** A button-styled link that also reaches the account site's pages outside the app's router. */
export function CtaLink({ href, label, style, textStyle }: { href: string; label: string; style: StyleProp<ViewStyle>; textStyle: StyleProp<TextStyle> }) {
  if (isSitePath(href)) {
    return (
      <Pressable accessibilityRole="link" onPress={() => openSite(href)} style={style}>
        <Text style={textStyle}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Link href={href as never} asChild>
      <Pressable accessibilityRole="link" style={style}>
        <Text style={textStyle}>{label}</Text>
      </Pressable>
    </Link>
  );
}
