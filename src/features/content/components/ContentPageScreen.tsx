import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { pageTitle } from '../../../shared/brand';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { pagePath, sitePages, usePage } from '../api/content';
import { Markdown } from './Markdown';

/** A published site page from the console, with links to the other help pages. */
export function ContentPageScreen({ slug }: { slug: string }) {
  const page = usePage(slug);
  const updated = page.data ? new Date(page.data.updatedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Head>
        <title>{pageTitle(page.data?.title ?? 'Help')}</title>
      </Head>
      <View style={styles.inner}>
        {page.isPending ? <ActivityIndicator color={colors.accent} /> : null}
        {page.isError ? <EmptyState title="Page not found" message="This page is not available. Try Help or the FAQ." /> : null}
        {page.data ? (
          <View style={styles.card}>
            <Text role="heading" aria-level={1} style={styles.title}>
              {page.data.title}
            </Text>
            <Markdown source={page.data.body} />
            <Text style={styles.updated}>Last updated {updated}</Text>
          </View>
        ) : null}
        <SiteLinks />
      </View>
    </ScrollView>
  );
}

/** Help, FAQ, terms, privacy, responsible gambling and contact: shown under pages and on the home page. */
export function SiteLinks() {
  return (
    <View style={styles.links} role="navigation" aria-label="Help and policies">
      {sitePages.map((p) => (
        <Link key={p.slug} href={pagePath(p.slug) as never} style={styles.link}>
          {p.label}
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: 40 },
  inner: { padding: spacing.md, gap: spacing.lg, width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg - 4, gap: spacing.md },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  updated: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: spacing.md, rowGap: spacing.sm },
  link: { color: colors.textMuted, fontSize: 13, fontWeight: '700', paddingVertical: 4 },
});
