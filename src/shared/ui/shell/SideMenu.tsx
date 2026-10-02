import { Link, usePathname } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSports } from "../../../features/catalog/api/catalog";
import type { IconName } from "../artwork";
import { Icon } from "../Icon";
import { colors, radius, spacing } from "../theme";

const comingSoon = [
  { label: "Tennis", icon: "sports/tennis" as IconName },
  { label: "Basketball", icon: "sports/basketball" as IconName },
  { label: "Cricket", icon: "sports/cricket" as IconName },
  { label: "Rugby", icon: "sports/rugby" as IconName },
];

function Item({
  href,
  label,
  icon,
  count,
}: {
  href?: string;
  label: string;
  icon?: IconName;
  count?: string;
}) {
  const pathname = usePathname();
  const on =
    href !== undefined &&
    (href === "/"
      ? pathname === "/"
      : pathname.startsWith(href.split("?")[0] ?? href));
  const body = (
    <View style={[styles.item, on && styles.itemOn, !href && styles.itemSoon]}>
      {icon ? <Icon name={icon} size={22} /> : null}
      <Text
        style={[styles.itemText, on && styles.itemTextOn]}
        numberOfLines={1}
      >
                {label}
      </Text>
      {count ? <Text style={styles.count}>{count}</Text> : null}
    </View>
  );
  return href ? (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="link"
        aria-current={on ? "page" : undefined}
      >
        {body}
      </Pressable>
    </Link>
  ) : (
    body
  );
}

/** Desktop: sports and casino switch, then the sports, then the top competitions from the catalogue. */
export function SideMenu() {
  const pathname = usePathname();
  const casino = pathname.startsWith("/casino");
  const soccer = useSports().data?.find((s) => s.sportId === "soccer");
  const upcoming = soccer?.competitions.reduce(
    (n, c) => n + c.upcomingFixtures,
    0,
  );

  return (
    <View style={styles.side}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.switch}>
          <Link href="/sports/soccer" asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.switchItem,
                !casino && styles.switchOn,
              ])}
            >
              <Text style={styles.switchText}>Sports</Text>
            </Pressable>
          </Link>
          <Link href="/casino" asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.switchItem,
                casino && styles.switchOn,
              ])}
            >
              <Text style={styles.switchText}>Casino</Text>
            </Pressable>
          </Link>
        </View>
        <Item href="/" label="Home" icon="nav/home" />
        <Item href="/my-bets" label="My bets" icon="nav/my-bets" />
        <Text style={styles.heading}>SPORTS</Text>
        <Item
          href="/sports/soccer"
          label="Football"
          icon="sports/football"
          count={upcoming ? String(upcoming) : undefined}
        />
        {comingSoon.map((s) => (
          <Item key={s.label} label={s.label} icon={s.icon} count="soon" />
        ))}
        {soccer && soccer.competitions.length > 0 ? (
          <Text style={styles.heading}>TOP COMPETITIONS</Text>
        ) : null}
        {soccer?.competitions.map((c) => (
          <Item
            key={c.competitionId}
            href={`/sports/soccer?competition=${encodeURIComponent(c.name)}`}
            label={c.name}
            count={String(c.upcomingFixtures)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  side: {
    width: 240,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.surfaceRaised,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  content: { padding: spacing.md, gap: 2 },
  switch: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.md },
  switchItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
  },
  switchOn: { backgroundColor: colors.accent },
  switchText: { color: colors.text, fontWeight: "800", fontSize: 13 },
  heading: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: 0.6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  itemOn: { backgroundColor: colors.card },
  itemSoon: {},
  itemText: {
    marginLeft: spacing.sm,
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  itemTextOn: { color: colors.text },
  count: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
});
