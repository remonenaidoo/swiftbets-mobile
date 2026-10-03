import { pageTitle } from '../../src/shared/brand';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { RaceCardScreen } from '../../src/features/racing/components/RaceCardScreen';

export default function RaceCardRoute() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();
  return (
    <>
      <Head>
        <title>{pageTitle('Race card')}</title>
      </Head>
      <RaceCardScreen raceId={raceId ?? ''} />
    </>
  );
}
