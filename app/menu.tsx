import Head from 'expo-router/head';
import { MenuScreen } from '../src/features/menu/components/MenuScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>Menu · SwiftBets</title>
      </Head>
      <MenuScreen />
    </>
  );
}
