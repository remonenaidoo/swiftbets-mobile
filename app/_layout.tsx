import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider as AtomProvider } from 'jotai';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppFrame } from '../src/shared/ui/AppFrame';
import { SessionGate } from '../src/shared/ui/SessionGate';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AtomProvider>
          <StatusBar style="light" />
          <SessionGate>
            <AppFrame>
              <Slot />
            </AppFrame>
          </SessionGate>
        </AtomProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
