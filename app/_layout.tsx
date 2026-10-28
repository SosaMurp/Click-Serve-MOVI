import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider, useSession } from '@/src/state/session';
import { ConnectivityBanner, ConnectivityProvider } from '@/src/state/connectivity';
import { RealtimeProvider } from '@/src/state/realtime';
import { DialogHost } from '@/src/ui/dialog';
import { ToastHost } from '@/src/ui/toast';
import { color, iconFont, LogoMark, Text, Wordmark } from '@/src/design';

function Splash() {
  return (
    <View style={styles.splash}>
      <StatusBar style="dark" />
      <LogoMark size={88} />
      <View style={{ marginTop: 16 }}><Wordmark size={30} /></View>
      <Text variant="overline" tone="muted" style={styles.splashText}>Lázaro Cárdenas</Text>
      <ActivityIndicator color={color.brand} style={{ marginTop: 24 }} />
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
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, ...iconFont });
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
  splash: { flex: 1, backgroundColor: color.ground, alignItems: 'center', justifyContent: 'center' },
  splashText: { marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' },
});
