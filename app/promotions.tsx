import { pageTitle } from '../src/shared/brand';
import Head from 'expo-router/head';
import { PromotionsScreen } from '../src/features/promotions/components/PromotionsScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>{pageTitle('Promotions')}</title>
      </Head>
      <PromotionsScreen />
    </>
  );
}
