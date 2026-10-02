import { pageTitle } from '../src/shared/brand';
import Head from 'expo-router/head';
import { MyBetsScreen } from '../src/features/my-bets/components/MyBetsScreen';

export default function MyBetsRoute() {
  return (
    <>
      <Head>
        <title>{pageTitle('My bets')}</title>
      </Head>
      <MyBetsScreen />
    </>
  );
}
