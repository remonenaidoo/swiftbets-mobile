import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView } from 'react-native';
import { VerifyEmailScreen } from '../../src/features/account/components/VerifyEmailScreen';

export default function Route() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  return (
    <ScrollView>
      <Head>
        <title>Confirm your email · SwiftBets</title>
      </Head>
      <VerifyEmailScreen token={token} />
    </ScrollView>
  );
}
