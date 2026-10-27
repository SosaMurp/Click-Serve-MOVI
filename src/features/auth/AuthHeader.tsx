import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CircleIcon, Logo, space, Text } from '../../design';

// Cabecera del acceso: logo real de Click & Serve sobre el fondo claro y título grande en dos líneas.
export function AuthHeader({ title, subtitle, back }: { title?: string; subtitle?: string; back?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.band, { paddingTop: insets.top + space.md }]}>
      <StatusBar style="dark" />
      <View style={styles.inner}>
        {back ? (
          <View style={styles.back}>
            <CircleIcon icon="arrow-left" label="Regresar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
          </View>
        ) : null}
        <Logo size={44} tagline />
        {title ? <Text variant="display" style={styles.title} accessibilityRole="header">{title}</Text> : null}
        {subtitle ? <Text variant="body" tone="soft" style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { alignItems: 'center', paddingBottom: space.md },
  inner: { width: '100%', maxWidth: 640, paddingHorizontal: space.lg },
  back: { marginBottom: space.md },
  title: { marginTop: space.xl },
  subtitle: { marginTop: space.xs },
});
