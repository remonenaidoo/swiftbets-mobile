import Head from 'expo-router/head';
import { pageTitle } from '../src/shared/brand';
import { InboxScreen } from '../src/features/inbox/components/InboxScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>{pageTitle('Inbox')}</title>
      </Head>
      <InboxScreen />
    </>
  );
}
