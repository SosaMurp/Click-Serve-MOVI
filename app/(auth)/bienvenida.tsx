import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button, color, LogoMark, space, Text } from '@/src/design';

// Bienvenida (referencia "Click & Serve · Bienvenida"): la app sin sesión abre aquí.
export default function Bienvenida() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }]}>
      <StatusBar style="dark" />
      <View style={styles.inner}>
        <View style={styles.hero}>
          <LogoMark size={168} />
          <Text variant="display" align="center" style={styles.title} accessibilityRole="header">Click &amp; Serve</Text>
          <Text variant="body" tone="muted" align="center" style={styles.lead}>
            Encuentra a los mejores expertos técnicos en Lázaro Cárdenas o únete a nuestra red de profesionales.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button title="Iniciar sesión" onPress={() => router.push('/login')} full size="lg" />
          <Button title="Crear cuenta" variant="accent" onPress={() => router.push('/registro')} full size="lg" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ground, alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: 480, paddingHorizontal: space.xl, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  title: { marginTop: space.lg, fontSize: 36, lineHeight: 42 },
  lead: { maxWidth: 320 },
  actions: { gap: space.md },
});
