import { pageTitle } from '../../src/shared/brand';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { CodeScreen } from '../../src/features/betslip/components/CodeScreen';

export default function CodeRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return (
    <>
      <Head>
        <title>{pageTitle('Booking code')}</title>
      </Head>
      <CodeScreen code={code ?? ''} />
    </>
  );
}
