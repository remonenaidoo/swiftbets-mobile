import Head from 'expo-router/head';
import { ScrollView } from 'react-native';
import { SignInScreen } from '../../src/features/account/components/SignInScreen';

export default function Route() {
  return (
    <ScrollView>
      <Head>
        <title>Sign in · SwiftBets</title>
      </Head>
      <SignInScreen />
    </ScrollView>
  );
}
