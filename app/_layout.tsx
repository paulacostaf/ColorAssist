import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SessaoProvider } from '@/src/contexts/SessaoContext';
import { initDatabase } from '@/src/database/database';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <SessaoProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="cadastro" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="nova-peca" options={{ headerShown: false }} />
          <Stack.Screen name="minhas-pecas" options={{ headerShown: false }} />
          <Stack.Screen name="editar-peca" options={{ headerShown: false }} />
          <Stack.Screen name="comparar-roupas" options={{ headerShown: false }} />
          <Stack.Screen name="teste-daltonismo" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessaoProvider>
  );
}
