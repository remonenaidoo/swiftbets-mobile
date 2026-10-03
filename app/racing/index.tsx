import { pageTitle } from '../../src/shared/brand';
import Head from 'expo-router/head';
import { RacingScreen } from '../../src/features/racing/components/RacingScreen';

export default function RacingRoute() {
  return (
    <>
      <Head>
        <title>{pageTitle('Horse racing')}</title>
      </Head>
      <RacingScreen />
    </>
  );
}
