import Head from 'expo-router/head';
import { FixturesScreen } from '../src/features/fixtures/components/FixturesScreen';

export default function SportsRoute() {
  return (
    <>
      <Head>
        <title>SwiftBets · Football betting</title>
      </Head>
      <FixturesScreen />
    </>
  );
}
