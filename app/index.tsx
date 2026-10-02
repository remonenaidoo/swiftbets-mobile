import Head from 'expo-router/head';
import { HomeScreen } from '../src/features/home/components/HomeScreen';

export default function HomeRoute() {
  return (
    <>
      <Head>
        <title>SwiftBets · Sports betting with live prices</title>
      </Head>
      <HomeScreen />
    </>
  );
}
