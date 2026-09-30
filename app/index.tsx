import { Stack } from 'expo-router';
import { FixturesScreen } from '../src/features/fixtures/components/FixturesScreen';

export default function FixturesRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Fixtures' }} />
      <FixturesScreen />
    </>
  );
}
