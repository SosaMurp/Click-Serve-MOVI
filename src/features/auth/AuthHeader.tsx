import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { color, IconButton, Plate, space, Text } from '../../design';

// Cabecera del acceso: banda cobalto con el rótulo de la marca en amarillo cromo.
export function AuthHeader({ title, subtitle, back }: { title?: string; subtitle?: string; back?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.band, { paddingTop: insets.top + space.md }]}>
      <StatusBar style="light" />
      <View style={styles.inner}>
        {back ? (
          <View style={styles.back}>
            <IconButton icon="arrow-left" label="Regresar" tint={color.inkOnColor} onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
          </View>
        ) : null}
        <Plate label="Click & Serve" tone="chrome" size="lg" />
        {title ? <Text variant="headline" tone="onColor" style={styles.title} accessibilityRole="header">{title}</Text> : null}
        {subtitle ? <Text variant="body" style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { backgroundColor: color.cobalt, paddingBottom: space.xl, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 640, paddingHorizontal: space.lg },
  back: { marginLeft: -space.sm, marginBottom: space.sm },
  title: { marginTop: space.lg },
  subtitle: { color: '#D6DEF7', marginTop: space.xs },
});
