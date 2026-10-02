import { pageTitle } from '../../src/shared/brand';
import Head from 'expo-router/head';
import { ScrollView } from 'react-native';
import { ForgotPasswordScreen } from '../../src/features/account/components/ForgotPasswordScreen';

export default function Route() {
  return (
    <ScrollView>
      <Head>
        <title>{pageTitle('Reset your password')}</title>
      </Head>
      <ForgotPasswordScreen />
    </ScrollView>
  );
}
