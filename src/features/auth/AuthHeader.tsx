import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CircleIcon, LogoMark, space, Text, Wordmark } from '../../design';

// Cabecera del acceso como en la referencia: logo centrado, "Click & Serve" y una línea gris debajo.
export function AuthHeader({ subtitle, back, logoSize = 72 }: { subtitle?: string; back?: boolean; logoSize?: number }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.band, { paddingTop: insets.top + space.md }]}>
      <StatusBar style="dark" />
      <View style={styles.inner}>
        {back ? (
          <View style={styles.back}>
            <CircleIcon icon="arrow-left" label="Regresar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/bienvenida'))} />
          </View>
        ) : null}
        <View style={styles.brand}>
          <LogoMark size={logoSize} />
          <Wordmark size={30} />
          {subtitle ? <Text variant="body" tone="muted" align="center" style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { alignItems: 'center', paddingBottom: space.lg },
  inner: { width: '100%', maxWidth: 640, paddingHorizontal: space.lg },
  back: { alignSelf: 'flex-start' },
  brand: { alignItems: 'center', gap: space.sm },
  subtitle: { maxWidth: 300 },
});
