import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Fragment, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isWeb } from '../../../shared/lib/config';
import { colors, spacing } from '../../../shared/ui/theme';
import { parseMarkdown, type Inline } from '../markdown';

function Inlines({ inlines }: { inlines: Inline[] }) {
  return inlines.map((inline, i) =>
    inline.kind === 'text' ? (
      <Text key={i} style={inline.bold ? styles.bold : undefined}>
        {inline.text}
      </Text>
    ) : inline.href.startsWith('/') ? (
      <Link key={i} href={inline.href as never} style={styles.link}>
        {inline.text}
      </Link>
    ) : (
      <Text key={i} accessibilityRole="link" style={styles.link} onPress={() => (isWeb ? globalThis.open?.(inline.href, '_blank', 'noopener') : void WebBrowser.openBrowserAsync(inline.href))}>
        {inline.text}
      </Text>
    ),
  );
}

/** A page body rendered as native text: never as HTML. */
export function Markdown({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return (
    <View style={styles.body}>
      {blocks.map((block, i) => (
        <Fragment key={i}>
          {block.kind === 'heading' ? (
            <Text role="heading" aria-level={block.level + 1} style={block.level === 1 ? styles.h1 : styles.h2}>
              <Inlines inlines={block.inlines} />
            </Text>
          ) : block.kind === 'paragraph' ? (
            <Text style={styles.p}>
              <Inlines inlines={block.inlines} />
            </Text>
          ) : (
            <View style={styles.list}>
              {block.items.map((item, n) => (
                <View key={n} style={styles.item}>
                  <Text style={styles.marker}>{block.ordered ? `${n + 1}.` : '•'}</Text>
                  <Text style={styles.itemText}>
                    <Inlines inlines={item} />
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.sm + 4 },
  h1: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: spacing.sm },
  h2: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.sm },
  p: { color: colors.text, fontSize: 15, lineHeight: 23 },
  bold: { fontWeight: '800' },
  link: { color: colors.odds, fontWeight: '700', textDecorationLine: 'underline' },
  list: { gap: 6 },
  item: { flexDirection: 'row', gap: spacing.sm },
  marker: { color: colors.textMuted, fontSize: 15, lineHeight: 23, minWidth: 18 },
  itemText: { color: colors.text, fontSize: 15, lineHeight: 23, flex: 1 },
});
