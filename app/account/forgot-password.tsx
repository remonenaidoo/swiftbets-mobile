import Head from 'expo-router/head';
import { ScrollView } from 'react-native';
import { ForgotPasswordScreen } from '../../src/features/account/components/ForgotPasswordScreen';

export default function Route() {
  return (
    <ScrollView>
      <Head>
        <title>Reset your password · SwiftBets</title>
      </Head>
      <ForgotPasswordScreen />
    </ScrollView>
  );
}
