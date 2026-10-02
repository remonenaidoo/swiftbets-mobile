import { brandName } from '../src/shared/brand';
import Head from 'expo-router/head';
import { HomeScreen } from '../src/features/home/components/HomeScreen';

export default function HomeRoute() {
  return (
    <>
      <Head>
        <title>{`${brandName} · Sports betting with live prices`}</title>
        <meta name="description" content={`${brandName}: football betting with live prices, cashout and casino. 18+ only.`} />
        <meta property="og:title" content={`${brandName} · Sports betting with live prices`} />
        <meta property="og:type" content="website" />
      </Head>
      <HomeScreen />
    </>
  );
}
