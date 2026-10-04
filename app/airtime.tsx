import Head from 'expo-router/head';
import { pageTitle } from '../src/shared/brand';
import { AirtimeScreen } from '../src/features/airtime/components/AirtimeScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>{pageTitle('Airtime and data')}</title>
      </Head>
      <AirtimeScreen />
    </>
  );
}
