import { pageTitle } from '../src/shared/brand';
import Head from 'expo-router/head';
import { ResultsScreen } from '../src/features/results/components/ResultsScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>{pageTitle('Results')}</title>
      </Head>
      <ResultsScreen sportId="soccer" />
    </>
  );
}
