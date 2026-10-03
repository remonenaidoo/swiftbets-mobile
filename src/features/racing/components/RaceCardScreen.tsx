import { useAtom } from 'jotai';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { useRace, type Race, type Runner } from '../api/racing';
import { legsOf, poolLabel } from '../model/combinations';
import { racingSlipAtom, togglePick } from '../state/racingSlip';
import { RacingSlip } from './RacingSlip';
import { postTime, rs, statusColor, statusLabel } from './styles';
import { ToteBuilder } from './ToteBuilder';

const afterTheOff = new Set(['off', 'result', 'official']);

function PriceButton({ race, runner, market }: { race: Race; runner: Runner; market: 'win' | 'place' }) {
  const [slip, setSlip] = useAtom(racingSlipAtom);
  const price = market === 'win' ? runner.winPrice : runner.placePrice;
  const on = slip.some((p) => p.raceId === race.raceId && p.runner === runner.number && p.market === market);
  const open = race.status === 'open' && !runner.scratched;
  const label = market === 'win' ? 'Win' : 'Place';
  return (
    <Pressable
      accessibilityRole="button"
      aria-pressed={on}
      accessibilityLabel={`${label} ${runner.name} ${price ? formatOdds(price) : 'SP'}`}
      disabled={!open}
      onPress={() =>
        setSlip((s) =>
          togglePick(s, {
            raceId: race.raceId,
            raceLabel: `${race.venue} R${race.number} · ${label}`,
            runner: runner.number,
            runnerName: runner.name,
            market,
            priceType: price ? 'fixed' : 'sp',
            price,
            stake: '',
          }),
        )
      }
      style={[rs.price, on && rs.priceOn, !open && rs.buttonDisabled]}
    >
      <Text style={rs.priceLabel}>{label.toUpperCase()}</Text>
      <Text style={rs.priceText}>{price ? formatOdds(price) : 'SP'}</Text>
    </Pressable>
  );
}

function RunnerRow({ race, runner }: { race: Race; runner: Runner }) {
  const showSp = afterTheOff.has(race.status) && runner.sp != null;
  return (
    <View style={[styles.runner, runner.scratched && styles.scratched]}>
      <View style={styles.cloth}>
        <Text style={styles.clothText}>{runner.number}</Text>
        {runner.draw != null ? <Text style={rs.small}>({runner.draw})</Text> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[rs.strong, runner.scratched && styles.struck]} numberOfLines={1}>
          {runner.name}
        </Text>
        <Text style={rs.small} numberOfLines={1}>
          J: {runner.jockey} · T: {runner.trainer}
        </Text>
        <Text style={rs.small} numberOfLines={1}>
          {runner.weight != null ? `${runner.weight}kg` : ''}
          {runner.form ? ` · Form ${runner.form}` : ''}
          {showSp ? ` · SP ${formatOdds(runner.sp!)}` : ''}
          {runner.scratched ? ' · Scratched' : ''}
          {runner.deductionPercent ? ` · Deduction ${runner.deductionPercent}%` : ''}
        </Text>
      </View>
      {runner.scratched || race.status !== 'open' ? null : (
        <View style={rs.row}>
          <PriceButton race={race} runner={runner} market="win" />
          {race.placeTerms ? <PriceButton race={race} runner={runner} market="place" /> : null}
        </View>
      )}
    </View>
  );
}

function Results({ race }: { race: Race }) {
  if (!race.result) {
    return null;
  }
  const name = (n: number) => race.runners.find((r) => r.number === n)?.name ?? `No. ${n}`;
  const joiner = (type: Parameters<typeof legsOf>[0]) => (legsOf(type) > 0 ? ' / ' : '-');
  return (
    <View style={rs.card}>
      <View style={rs.between}>
        <Text style={rs.title} accessibilityRole="header">
          Result
        </Text>
        <Text style={rs.muted}>{race.result.official ? 'Official' : 'Unofficial'}</Text>
      </View>
      {race.result.positions.map((p) => (
        <View key={p.position} style={rs.row}>
          <Text style={[rs.strong, { width: 32 }]}>{p.position}.</Text>
          <Text style={[rs.text, { flex: 1 }]}>
            {p.runners.map((n) => `${n}. ${name(n)}`).join(', ')}
            {p.runners.length > 1 ? '  (dead heat)' : ''}
          </Text>
        </View>
      ))}
      {race.dividends.length > 0 ? (
        <>
          <Text style={[rs.strong, { marginTop: spacing.sm }]}>Dividends per R1</Text>
          {race.dividends.map((d) => (
            <View key={d.poolId} style={{ gap: 2 }}>
              {d.lines.map((l, i) => (
                <View key={i} style={rs.between}>
                  <Text style={rs.text}>
                    {poolLabel(d.type)} {l.selections.map((s) => s.join(',')).join(joiner(d.type))}
                  </Text>
                  <Text style={[rs.priceText, { color: colors.positive }]}>{formatRand(l.perUnit)}</Text>
                </View>
              ))}
              {d.lines.length === 0 ? <Text style={rs.muted}>{poolLabel(d.type)}: {d.status}</Text> : null}
              {d.carryOver ? <Text style={rs.small}>Carry over {formatRand(d.carryOver)}</Text> : null}
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

/** One race: runners with fixed prices, the racing slip, the tote builder, then the result once declared. */
export function RaceCardScreen({ raceId }: { raceId: string }) {
  const wide = useIsWide();
  const race = useRace(raceId);

  if (race.isPending) {
    return <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />;
  }
  if (race.isError || !race.data) {
    return (
      <View style={styles.page}>
        <EmptyState title="Race not found" message="This race card could not be loaded." />
      </View>
    );
  }
  const r = race.data;
  const terms = r.placeTerms ? `Place ${r.placeTerms.fraction} odds, first ${r.placeTerms.places}` : 'Win only';

  const card = (
    <View style={{ gap: spacing.md, flex: wide ? 3 : undefined }}>
      <View style={rs.card}>
        <View style={rs.between}>
          <Text style={rs.title} accessibilityRole="header">
            {r.venue} R{r.number}
          </Text>
          <Text style={[styles.status, { color: statusColor(r.status) }]}>{statusLabel[r.status] ?? r.status}</Text>
        </View>
        <Text style={rs.text}>{r.name}</Text>
        <Text style={rs.muted}>
          {postTime(r.postTime)} · {r.distance}m · {r.going} · {terms}
        </Text>
      </View>
      <View style={[rs.card, { padding: 0, gap: 0 }]}>
        {r.runners.map((runner) => (
          <RunnerRow key={runner.number} race={r} runner={runner} />
        ))}
      </View>
      <Results race={r} />
    </View>
  );
  const side = (
    <View style={{ gap: spacing.md, flex: wide ? 2 : undefined }}>
      <RacingSlip />
      {r.status === 'open' ? <ToteBuilder key={r.raceId} race={r} /> : null}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={wide ? styles.columns : { gap: spacing.md }}>
        {card}
        {side}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, paddingBottom: 40 },
  columns: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  status: { fontSize: 13, fontWeight: '800' },
  runner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm + 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  scratched: { opacity: 0.5 },
  struck: { textDecorationLine: 'line-through' },
  cloth: { width: 36, alignItems: 'center' },
  clothText: { color: colors.text, fontWeight: '900', fontSize: 16, backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
});
