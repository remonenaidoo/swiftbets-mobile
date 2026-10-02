import { pageTitle } from '../../src/shared/brand';
import Head from 'expo-router/head';
import { ScrollView } from 'react-native';
import { SignInScreen } from '../../src/features/account/components/SignInScreen';

export default function Route() {
  return (
    <ScrollView>
      <Head>
        <title>{pageTitle('Sign in')}</title>
      </Head>
      <SignInScreen />
    </ScrollView>
  );
}
