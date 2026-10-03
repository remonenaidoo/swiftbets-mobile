import { pageTitle } from '../../src/shared/brand';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { BetDetailScreen } from '../../src/features/my-bets/components/BetDetailScreen';

export default function BetDetailRoute() {
  const { couponId } = useLocalSearchParams<{ couponId: string }>();
  return (
    <>
      <Head>
        <title>{pageTitle('Bet details')}</title>
      </Head>
      <BetDetailScreen couponId={couponId ?? ''} />
    </>
  );
}
