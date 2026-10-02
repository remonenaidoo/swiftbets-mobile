import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { SportScreen } from '../../src/features/sports/components/SportScreen';

export default function SportRoute() {
  const { sport } = useLocalSearchParams<{ sport: string }>();
  return (
    <>
      <Head>
        <title>{sport === 'soccer' ? 'Football betting' : 'Sports'} · SwiftBets</title>
      </Head>
      <SportScreen sportId={sport ?? 'soccer'} />
    </>
  );
}
