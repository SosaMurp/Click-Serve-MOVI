import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts, Bungee_400Regular } from '@expo-google-fonts/bungee';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider, useSession } from '@/src/state/session';
import { ConnectivityBanner, ConnectivityProvider } from '@/src/state/connectivity';
import { RealtimeProvider } from '@/src/state/realtime';
import { DialogHost } from '@/src/ui/dialog';
import { ToastHost } from '@/src/ui/toast';
import { color, iconFont, Plate, Text } from '@/src/design';

function Splash() {
  return (
    <View style={styles.splash}>
      <StatusBar style="light" />
      <Plate label="Click & Serve" tone="chrome" size="lg" />
      <Text variant="bodySm" style={styles.splashText}>Lázaro Cárdenas</Text>
      <ActivityIndicator color={color.inkOnColor} style={{ marginTop: 24 }} />
    </View>
  );
}

// RF-02: rutas protegidas por rol. Sin sesión solo existe el acceso; cada rol ve su propio grupo.
function RootStack() {
  const { status, user } = useSession();
  if (status === 'loading') return <Splash />;
  const signedIn = status === 'signedIn' && !!user;
  return (
    <Stack screenOptions={{ headerShown: false, animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default', contentStyle: { backgroundColor: color.ground } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && user?.rol === 'cliente'}>
        <Stack.Screen name="(cliente)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && user?.rol === 'tecnico'}>
        <Stack.Screen name="(tecnico)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(comun)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Bungee_400Regular, ...iconFont });
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ConnectivityProvider>
          <RealtimeProvider>
            {fontsLoaded ? <RootStack /> : <Splash />}
            <ConnectivityBanner />
            <DialogHost />
            <ToastHost />
          </RealtimeProvider>
        </ConnectivityProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: color.cobalt, alignItems: 'center', justifyContent: 'center' },
  splashText: { color: '#C9D3F5', marginTop: 12, letterSpacing: 2, textTransform: 'uppercase' },
});
