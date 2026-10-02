import { pageTitle } from '../../src/shared/brand';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { SportScreen } from '../../src/features/sports/components/SportScreen';

export default function SportRoute() {
  const { sport } = useLocalSearchParams<{ sport: string }>();
  return (
    <>
      <Head>
        <title>{pageTitle(sport === 'soccer' ? 'Football betting' : 'Sports')}</title>
      </Head>
      <SportScreen sportId={sport ?? 'soccer'} />
    </>
  );
}
