import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../src/store/authStore';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/utils/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function RootLayout() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) router.replace('/(tabs)/home');
      else router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        {isLoading ? (
          // Splash while checking stored token — avoids blank white flash
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }}>
            <ActivityIndicator color={Colors.white} size="large" />
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="store/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          </Stack>
        )}
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
