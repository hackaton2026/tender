import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '../components/useColorScheme';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/useAuthStore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { session, initialized, setSession, setInitialized } = useAuthStore();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded && initialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialized]);

  useEffect(() => {
    if (!initialized) return;

    // TODO: Temporary bypass for quick web local preview
    // Remove this when Supabase keys are provided in .env
    const IS_DEV_BYPASS = true;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup && !IS_DEV_BYPASS) {
      // Redirect to the login page
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      // Redirect away from the login page
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  if (!fontsLoaded || !initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="review" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="proposal/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <InitialLayout />
    </ThemeProvider>
  );
}
