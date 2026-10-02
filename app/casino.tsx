import Head from 'expo-router/head';
import { CasinoScreen } from '../src/features/casino/components/CasinoScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>Casino · SwiftBets</title>
      </Head>
      <CasinoScreen />
    </>
  );
}
