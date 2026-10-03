import { pageTitle } from '../../src/shared/brand';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useSports } from '../../src/features/catalog/api/catalog';
import { SportScreen } from '../../src/features/sports/components/SportScreen';
import { sportInfo } from '../../src/features/sports/sports';

export default function SportRoute() {
  const { sport } = useLocalSearchParams<{ sport: string }>();
  const sportId = sport ?? 'soccer';
  const info = sportInfo(sportId, useSports().data);
  return (
    <>
      <Head>
        <title>{pageTitle(`${info.name} betting`)}</title>
      </Head>
      <SportScreen sportId={sportId} />
    </>
  );
}
