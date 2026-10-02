import Head from 'expo-router/head';
import { PromotionsScreen } from '../src/features/promotions/components/PromotionsScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>Promotions · SwiftBets</title>
      </Head>
      <PromotionsScreen />
    </>
  );
}
