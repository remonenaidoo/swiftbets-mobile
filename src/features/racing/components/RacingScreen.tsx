import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { useSession } from '../../../shared/lib/useSession';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Section } from '../../../shared/ui/Section';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { racingDate, useMeetings, useRacingBets, type RacingBet } from '../api/racing';
import { poolLabel, type PoolType } from '../model/combinations';
import { postTime, rs, statusColor, statusLabel } from './styles';

const days = [
  { ahead: 0, label: 'Today' },
  { ahead: 1, label: 'Tomorrow' },
];

const betTone: Record<RacingBet['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: colors.odds },
  accepted: { label: 'Open', color: colors.odds },
  refused: { label: 'Refused', color: colors.negative },
  won: { label: 'Won', color: colors.positive },
  lost: { label: 'Lost', color: colors.textMuted },
  void: { label: 'Void', color: colors.warning },
  refunded: { label: 'Refunded', color: colors.warning },
};

function marketLabel(bet: RacingBet): string {
  if (bet.kind === 'fixed') {
    const price = bet.priceType === 'sp' ? 'SP' : bet.price ? formatOdds(bet.price) : '';
    return `${bet.market === 'place' ? 'Place' : 'Win'} @ ${price}`;
  }
  return `${poolLabel(bet.market as PoolType)}${bet.mode && bet.mode !== 'straight' ? ` (${bet.mode})` : ''} · ${bet.combinations} combos`;
}

function BetRow({ bet }: { bet: RacingBet }) {
  const tone = betTone[bet.status] ?? { label: bet.status, color: colors.textMuted };
  const picks = bet.runnerNames?.length ? bet.runnerNames.join(', ') : bet.selections.map((s) => s.join(',')).join(' / ');
  return (
    <Link href={`/racing/${encodeURIComponent(bet.raceId)}` as never} asChild>
      <Pressable style={rs.card}>
        <View style={rs.between}>
          <Text style={rs.strong} numberOfLines={1}>
            {bet.venue} R{bet.raceNumber}
          </Text>
          <Text style={[styles.badge, { color: tone.color }]}>{tone.label}</Text>
        </View>
        <Text style={rs.text} numberOfLines={2}>
          {picks}
        </Text>
        <View style={rs.between}>
          <Text style={rs.muted}>{marketLabel(bet)}</Text>
          <Text style={rs.muted}>
            Stake {formatRand(bet.stake)}
            {bet.payout ? ` · Paid ${formatRand(bet.payout)}` : ''}
            {bet.refunded ? ` · Refunded ${formatRand(bet.refunded)}` : ''}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

/** Today's (or tomorrow's) meetings with their races, then the signed-in player's racing bets. */
export function RacingScreen() {
  const [ahead, setAhead] = useState(0);
  const meetings = useMeetings(racingDate(ahead));
  const signedIn = useSession().data?.signedIn === true;
  const bets = useRacingBets();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={rs.row} role="tablist">
        {days.map((d) => (
          <Pressable key={d.ahead} role="tab" aria-selected={ahead === d.ahead} onPress={() => setAhead(d.ahead)} style={[rs.chip, ahead === d.ahead && rs.chipOn]}>
            <Text style={rs.chipText}>{d.label}</Text>
          </Pressable>
        ))}
      </View>

      {meetings.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {meetings.isError ? <EmptyState title="Racing is not available" message="We could not load the meetings. Try again in a moment." /> : null}
      {meetings.isSuccess && meetings.data.length === 0 ? <EmptyState title="No meetings" message="There is no racing on this day." /> : null}

      {meetings.data?.map((m) => (
        <Section key={m.meetingId} title={m.venue} icon="sports/horse-racing">
          <View style={styles.races}>
            {m.races.map((r) => (
              <Link key={r.raceId} href={`/racing/${encodeURIComponent(r.raceId)}` as never} asChild>
                <Pressable style={styles.race} accessibilityLabel={`${m.venue} race ${r.number}, ${postTime(r.postTime)}, ${statusLabel[r.status] ?? r.status}`}>
                  <View style={rs.between}>
                    <Text style={styles.raceNumber}>R{r.number}</Text>
                    <Text style={styles.time}>{postTime(r.postTime)}</Text>
                  </View>
                  <Text style={rs.small} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <View style={rs.between}>
                    <Text style={rs.small}>
                      {r.distance}m · {r.runners} runners
                    </Text>
                    <Text style={[styles.status, { color: statusColor(r.status) }]}>{statusLabel[r.status] ?? r.status}</Text>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        </Section>
      ))}

      {signedIn ? (
        <Section title="My racing bets" icon="nav/my-bets">
          {bets.isPending ? <ActivityIndicator color={colors.accent} /> : null}
          {bets.isSuccess && bets.data.length === 0 ? <Text style={rs.muted}>No racing bets yet.</Text> : null}
          {bets.isError ? <Text style={rs.error}>Could not load your racing bets.</Text> : null}
          <View style={styles.bets}>
            {bets.data?.map((b) => (
              <BetRow key={b.betId} bet={b} />
            ))}
          </View>
        </Section>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.lg, paddingBottom: 40 },
  races: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  race: { flexGrow: 1, flexBasis: 160, maxWidth: 260, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm + 4, gap: 4 },
  raceNumber: { color: colors.text, fontWeight: '900', fontSize: 16 },
  time: { color: colors.odds, fontWeight: '800', fontVariant: ['tabular-nums'] },
  status: { fontSize: 12, fontWeight: '800' },
  badge: { fontSize: 12, fontWeight: '800' },
  bets: { gap: spacing.sm },
});
