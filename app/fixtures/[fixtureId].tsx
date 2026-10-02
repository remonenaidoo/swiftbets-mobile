import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { FixtureScreen } from '../../src/features/fixtures/components/FixtureScreen';

export default function FixtureRoute() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: string }>();
  return (
    <>
      <Head>
        <title>Match betting · SwiftBets</title>
      </Head>
      <FixtureScreen fixtureId={fixtureId ?? ''} />
    </>
  );
}
