import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView } from 'react-native';
import { ResetPasswordScreen } from '../../src/features/account/components/ResetPasswordScreen';

export default function Route() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  return (
    <ScrollView>
      <Head>
        <title>Choose a new password · SwiftBets</title>
      </Head>
      <ResetPasswordScreen token={token} />
    </ScrollView>
  );
}
