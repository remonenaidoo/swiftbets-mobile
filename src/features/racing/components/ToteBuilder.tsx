import { Link } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { formatRand } from '../../../shared/lib/format';
import { useSession } from '../../../shared/lib/useSession';
import { colors } from '../../../shared/ui/theme';
import { toastAtom } from '../../../shared/ui/Toast';
import { racingRefusal, useLegRaces, usePlaceTote, type Pool, type Race, type Runner } from '../api/racing';
import { combinations, entryProblem, legsOf, modeLabel, modesFor, poolLabel, rowsFor, type EntryMode } from '../model/combinations';
import { stakeMinor } from '../state/racingSlip';
import { rs } from './styles';

/** Pools a bet can start from this race: its own single-race pools, and the multi-leg pools whose first leg it is. */
export function startablePools(race: Race): Pool[] {
  return race.pools.filter((p) => p.status === 'open' && (legsOf(p.type) === 0 || p.legNumber === 1));
}

function RunnerGrid({ runners, picked, onToggle, label }: { runners: Runner[]; picked: number[]; onToggle: (n: number) => void; label: string }) {
  return (
    <View style={rs.wrap} role="group" aria-label={label}>
      {runners
        .filter((r) => !r.scratched)
        .map((r) => {
          const on = picked.includes(r.number);
          return (
            <Pressable key={r.number} role="checkbox" aria-checked={on} accessibilityLabel={`${label} ${r.number} ${r.name}`} onPress={() => onToggle(r.number)} style={[rs.chip, { minWidth: 44, alignItems: 'center' }, on && rs.chipOn]}>
              <Text style={[rs.chipText, on && { color: colors.odds }]}>{r.number}</Text>
            </Pressable>
          );
        })}
    </View>
  );
}

/** Tote entries: pick a pool and entry mode, runners per position or leg; the count and cost update as you pick. */
export function ToteBuilder({ race }: { race: Race }) {
  const pools = startablePools(race);
  const [poolId, setPoolId] = useState<string | undefined>(pools[0]?.poolId);
  const pool = pools.find((p) => p.poolId === poolId) ?? pools[0];
  const [mode, setMode] = useState<EntryMode>('straight');
  const [rows, setRows] = useState<number[][]>([]);
  const [unit, setUnit] = useState('1');
  const legRaces = useLegRaces(pool && legsOf(pool.type) > 0 ? pool.legRaceIds : []);
  const place = usePlaceTote();
  const toast = useSetAtom(toastAtom);
  const signedIn = useSession().data?.signedIn === true;

  if (!pool) {
    return null;
  }

  const labels = rowsFor(pool.type, mode);
  const selections = labels.map((_, i) => [...(rows[i] ?? [])].sort((a, b) => a - b));
  const count = combinations(pool.type, mode, selections);
  const unitMinor = stakeMinor(unit);
  const problem = entryProblem(count, unitMinor);
  const legs = legsOf(pool.type) > 0;

  const choosePool = (p: Pool) => {
    setPoolId(p.poolId);
    setMode('straight');
    setRows([]);
    place.reset();
  };
  const chooseMode = (m: EntryMode) => {
    setMode(m);
    setRows([]);
    place.reset();
  };
  const toggle = (row: number, runner: number) =>
    setRows((current) => {
      const next = labels.map((_, i) => current[i] ?? []);
      next[row] = next[row]!.includes(runner) ? next[row]!.filter((r) => r !== runner) : [...next[row]!, runner];
      return next;
    });

  const submit = () =>
    place.mutate(
      { poolId: pool.poolId, mode, selections, unitStake: unitMinor },
      {
        onSuccess: () => {
          toast(`${poolLabel(pool.type)} placed · ${formatRand(count * unitMinor)}`);
          setRows([]);
        },
      },
    );

  return (
    <View style={rs.card}>
      <Text style={rs.title} accessibilityRole="header">
        Tote bets
      </Text>
      <View style={rs.wrap} role="radiogroup" aria-label="Pool">
        {pools.map((p) => (
          <Pressable key={p.poolId} role="radio" aria-checked={p.poolId === pool.poolId} onPress={() => choosePool(p)} style={[rs.chip, p.poolId === pool.poolId && rs.chipOn]}>
            <Text style={rs.chipText}>{poolLabel(p.type)}</Text>
          </Pressable>
        ))}
      </View>
      {modesFor(pool.type).length > 1 ? (
        <View style={rs.wrap} role="radiogroup" aria-label="Entry">
          {modesFor(pool.type).map((m) => (
            <Pressable key={m} role="radio" aria-checked={m === mode} onPress={() => chooseMode(m)} style={[rs.chip, m === mode && rs.chipOn]}>
              <Text style={rs.chipText}>{modeLabel(pool.type, m)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {legs ? <Text style={rs.small}>Legs start at this race and run through the next {labels.length - 1} races.</Text> : null}

      {labels.map((label, i) => {
        const legRace = legs ? legRaces[i]?.data : race;
        return (
          <View key={label} style={{ gap: 6 }}>
            <Text style={rs.muted}>
              {label}
              {legs && legRace ? ` · R${legRace.number} ${legRace.venue}` : ''}
            </Text>
            {legRace ? <RunnerGrid runners={legRace.runners} picked={rows[i] ?? []} onToggle={(n) => toggle(i, n)} label={label} /> : legs && legRaces[i]?.isError ? <Text style={rs.error}>Could not load this leg.</Text> : <ActivityIndicator color={colors.accent} />}
          </View>
        );
      })}

      <View style={rs.row}>
        <Text style={rs.muted}>Unit (R)</Text>
        <TextInput accessibilityLabel="Unit stake in rand" value={unit} onChangeText={setUnit} inputMode="decimal" keyboardType="decimal-pad" style={[rs.input, { width: 90 }]} />
      </View>
      <View style={rs.between}>
        <Text style={rs.strong} accessibilityLiveRegion="polite">
          {count} {count === 1 ? 'combination' : 'combinations'}
        </Text>
        <Text style={[rs.priceText, { color: colors.positive }]}>{formatRand(count * unitMinor)}</Text>
      </View>
      {count > 0 && problem ? <Text style={rs.error}>{problem}</Text> : null}
      {place.isError ? (
        <Text style={rs.error} accessibilityRole="alert">
          {racingRefusal(place.error)}
        </Text>
      ) : null}
      {!signedIn ? (
        <Link href="/account/sign-in" asChild>
          <Pressable accessibilityRole="button" style={rs.button}>
            <Text style={rs.buttonText}>Sign in to place this bet</Text>
          </Pressable>
        </Link>
      ) : (
        <Pressable accessibilityRole="button" disabled={!!problem || place.isPending} onPress={submit} style={[rs.button, (!!problem || place.isPending) && rs.buttonDisabled]}>
          <Text style={rs.buttonText}>{place.isPending ? 'Placing…' : `Place ${poolLabel(pool.type)} ${count > 0 ? formatRand(count * unitMinor) : ''}`}</Text>
        </Pressable>
      )}
    </View>
  );
}
