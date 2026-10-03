import { Link } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { api } from '../../../shared/lib/session';
import { useSession } from '../../../shared/lib/useSession';
import { colors } from '../../../shared/ui/theme';
import { toastAtom } from '../../../shared/ui/Toast';
import { raceKey, racingRefusal, usePlaceFixed, type Race } from '../api/racing';
import { acceptPick, racingSlipAtom, repricePick, stakeMinor, type RacingPick } from '../state/racingSlip';
import { rs } from './styles';

const pickKey = (p: RacingPick) => `${p.raceId}:${p.runner}:${p.market}`;

/** Fixed-odds racing singles: one bet per pick, each with its own stake, fixed price or SP. */
export function RacingSlip() {
  const [slip, setSlip] = useAtom(racingSlipAtom);
  const place = usePlaceFixed();
  const queryClient = useQueryClient();
  const toast = useSetAtom(toastAtom);
  const signedIn = useSession().data?.signedIn === true;
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (slip.length === 0) {
    return null;
  }

  const update = (pick: RacingPick, change: Partial<RacingPick>) => setSlip((s) => s.map((p) => (pickKey(p) === pickKey(pick) ? { ...p, ...change } : p)));
  const moved = slip.some((p) => p.previousPrice !== undefined);
  const ready = slip.every((p) => stakeMinor(p.stake) >= 100 && (p.priceType === 'sp' || p.price != null));

  const placeAll = async () => {
    setErrors({});
    for (const pick of slip) {
      try {
        await place.mutateAsync({
          raceId: pick.raceId,
          runner: pick.runner,
          market: pick.market,
          priceType: pick.priceType,
          ...(pick.priceType === 'fixed' && pick.price != null ? { price: pick.price } : {}),
          stake: stakeMinor(pick.stake),
        });
        setSlip((s) => s.filter((p) => pickKey(p) !== pickKey(pick)));
        toast(`Bet placed · ${pick.runnerName} ${formatRand(stakeMinor(pick.stake))}`);
      } catch (error) {
        if (error instanceof ApiError && error.code === 'price_changed') {
          const race = await queryClient.fetchQuery({ queryKey: raceKey(pick.raceId), queryFn: () => api<Race>(`/racing/races/${encodeURIComponent(pick.raceId)}`), staleTime: 0 });
          setSlip((s) => repricePick(s, pick, race));
        }
        setErrors((e) => ({ ...e, [pickKey(pick)]: racingRefusal(error) }));
      }
    }
  };

  return (
    <View style={rs.card}>
      <View style={rs.between}>
        <Text style={rs.title} accessibilityRole="header">
          Racing slip
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setSlip([])}>
          <Text style={rs.muted}>Clear</Text>
        </Pressable>
      </View>
      {slip.map((p) => {
        const stake = stakeMinor(p.stake);
        const toReturn = p.priceType === 'fixed' && p.price ? Math.round(stake * p.price) : null;
        return (
          <View key={pickKey(p)} style={{ gap: 6, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={rs.between}>
              <View style={{ flex: 1 }}>
                <Text style={rs.strong}>
                  {p.runner}. {p.runnerName}
                </Text>
                <Text style={rs.small} numberOfLines={1}>
                  {p.raceLabel}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {p.previousPrice !== undefined ? <Text style={[rs.small, { textDecorationLine: 'line-through' }]}>{formatOdds(p.previousPrice)}</Text> : null}
                <Text style={[rs.priceText, p.previousPrice !== undefined && { color: colors.warning }]}>{p.priceType === 'sp' || p.price == null ? 'SP' : formatOdds(p.price)}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${p.runnerName}`} onPress={() => setSlip((s) => s.filter((x) => pickKey(x) !== pickKey(p)))}>
                  <Text style={rs.small}>Remove</Text>
                </Pressable>
              </View>
            </View>
            <View style={rs.wrap}>
              <Text style={[rs.chip, rs.chipOn, rs.chipText]}>{p.market === 'win' ? 'Win' : 'Place'}</Text>
              {p.price != null
                ? (['fixed', 'sp'] as const).map((t) => (
                    <Pressable key={t} role="radio" aria-checked={p.priceType === t} onPress={() => update(p, { priceType: t })} style={[rs.chip, p.priceType === t && rs.chipOn]}>
                      <Text style={rs.chipText}>{t === 'fixed' ? 'Fixed' : 'SP'}</Text>
                    </Pressable>
                  ))
                : null}
            </View>
            <View style={rs.row}>
              <TextInput accessibilityLabel={`Stake for ${p.runnerName} in rand`} value={p.stake} onChangeText={(v) => update(p, { stake: v })} inputMode="decimal" keyboardType="decimal-pad" placeholder="Stake (R)" placeholderTextColor={colors.textMuted} style={[rs.input, { flex: 1 }]} />
              <Text style={rs.muted}>{toReturn ? `Returns ${formatRand(toReturn)}` : 'Paid at SP'}</Text>
            </View>
            {p.previousPrice !== undefined ? (
              <Pressable accessibilityRole="button" onPress={() => setSlip((s) => acceptPick(s, p))} style={[rs.button, rs.buttonWarn]}>
                <Text style={rs.buttonText}>Accept new price {p.price != null ? formatOdds(p.price) : ''}</Text>
              </Pressable>
            ) : null}
            {errors[pickKey(p)] ? (
              <Text style={rs.error} accessibilityRole="alert">
                {errors[pickKey(p)]}
              </Text>
            ) : null}
          </View>
        );
      })}
      {!signedIn ? (
        <Link href="/account/sign-in" asChild>
          <Pressable accessibilityRole="button" style={rs.button}>
            <Text style={rs.buttonText}>Sign in to place this bet</Text>
          </Pressable>
        </Link>
      ) : (
        <Pressable accessibilityRole="button" disabled={!ready || moved || place.isPending} onPress={() => void placeAll()} style={[rs.button, (!ready || moved || place.isPending) && rs.buttonDisabled]}>
          <Text style={rs.buttonText}>{place.isPending ? 'Placing…' : slip.length > 1 ? `Place ${slip.length} bets` : 'Place bet'}</Text>
        </Pressable>
      )}
      {!ready ? <Text style={rs.small}>Minimum stake is R1.</Text> : null}
    </View>
  );
}
