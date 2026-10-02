import 'react-native-reanimated';
import React, { useEffect, useState, useRef } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import COLORS from '@/constants/Colors';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { NotificationProvider } from "@/contexts/NotificationContext";

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const AuraDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.danger,
  },
};

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const redirectRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem('@aura_onboarding')
      .then((raw) => {
        if (cancelled) return;
        const data = raw ? JSON.parse(raw) : null;
        const completed = data?.completed === true;
        const inOnboarding = segments[0] === 'onboarding';

        if (!completed && !inOnboarding) {
          console.log('[Navigation] Onboarding not completed, redirecting to /onboarding');
          redirectRef.current = '/onboarding';
        } else if (completed && inOnboarding) {
          console.log('[Navigation] Onboarding already completed, redirecting to tabs');
          redirectRef.current = '/(tabs)/(home)';
        }
        setStatus('ready');
      })
      .catch((e) => {
        console.error('[Navigation] Error checking onboarding state:', e);
        if (!cancelled) setStatus('ready');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === 'ready' && redirectRef.current) {
      router.replace(redirectRef.current as Parameters<typeof router.replace>[0]);
      redirectRef.current = null;
    }
  }, [status]);

  if (status === 'loading') return null;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <DevErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider value={AuraDarkTheme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SubscriptionProvider>
            <NavigationGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen
                  name="paywall"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="lesson/[id]"
                  options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    headerBackButtonDisplayMode: 'minimal',
                    headerTintColor: COLORS.text,
                  }}
                />
              </Stack>
            </NavigationGuard>
            </SubscriptionProvider>
            <SystemBars style="light" />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
    </NotificationProvider>
  );
}
