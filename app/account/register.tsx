import Head from 'expo-router/head';
import { ScrollView } from 'react-native';
import { RegisterScreen } from '../../src/features/account/components/RegisterScreen';

export default function Route() {
  return (
    <ScrollView>
      <Head>
        <title>Open an account · SwiftBets</title>
      </Head>
      <RegisterScreen />
    </ScrollView>
  );
}
