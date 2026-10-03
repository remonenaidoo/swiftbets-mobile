import Head from 'expo-router/head';
import { pageTitle } from '../src/shared/brand';
import { NotificationSettingsScreen } from '../src/features/inbox/components/NotificationSettingsScreen';

export default function Route() {
  return (
    <>
      <Head>
        <title>{pageTitle('Notifications')}</title>
      </Head>
      <NotificationSettingsScreen />
    </>
  );
}
