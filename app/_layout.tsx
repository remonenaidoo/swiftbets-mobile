import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider as AtomProvider } from 'jotai';
import { useState } from 'react';
import { colors } from '../src/shared/ui/theme';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));

  return (
    <QueryClientProvider client={queryClient}>
      <AtomProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: colors.surfaceRaised }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.surface } }} />
      </AtomProvider>
    </QueryClientProvider>
  );
}
