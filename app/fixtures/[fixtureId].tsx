import { pageTitle } from '../../src/shared/brand';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { FixtureScreen } from '../../src/features/fixtures/components/FixtureScreen';

export default function FixtureRoute() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: string }>();
  return (
    <>
      <Head>
        <title>{pageTitle('Match betting')}</title>
      </Head>
      <FixtureScreen fixtureId={fixtureId ?? ''} />
    </>
  );
}
