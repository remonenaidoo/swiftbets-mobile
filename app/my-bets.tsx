import Head from 'expo-router/head';
import { MyBetsScreen } from '../src/features/my-bets/components/MyBetsScreen';

export default function MyBetsRoute() {
  return (
    <>
      <Head>
        <title>My bets · SwiftBets</title>
      </Head>
      <MyBetsScreen />
    </>
  );
}
