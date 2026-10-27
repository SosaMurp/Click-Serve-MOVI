import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { IconButton } from './Button';
import { IconName } from './Icon';
import { Text } from './Text';
import { color, space } from './tokens';
import { dialog } from '../ui/dialog';

export type AppBarAction = { icon: IconName; label: string; onPress: () => void; badge?: number };

type Props = {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  // RF-84: si hay cambios sin guardar, preguntar antes de salir.
  confirmDiscard?: boolean;
  actions?: AppBarAction[];
  right?: React.ReactNode;
  fallbackHref?: string;
};

// Barra superior de la pantalla: esmalte cobalto con el título en letra de rótulo.
export function AppBar({ title, subtitle, back = true, onBack, confirmDiscard, actions = [], right, fallbackHref = '/' }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = async () => {
    if (confirmDiscard) {
      const ok = await dialog.confirm({
        title: '¿Salir sin guardar?',
        message: 'Los cambios que hiciste en esta pantalla se perderán.',
        confirmText: 'Salir',
        cancelText: 'Seguir editando',
        destructive: true,
      });
      if (!ok) return;
    }
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref as never);
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.row}>
        {back ? <IconButton icon="arrow-left" label="Regresar" tint={color.inkOnColor} onPress={goBack} /> : <View style={styles.spacer} />}
        <View style={styles.titles}>
          <Text variant="appbar" tone="onColor" numberOfLines={1} accessibilityRole="header">{title}</Text>
          {subtitle ? <Text variant="caption" style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {actions.map((a) => (
          <IconButton key={a.label} icon={a.icon} label={a.label} tint={color.inkOnColor} onPress={a.onPress} badge={a.badge} />
        ))}
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: color.cobalt },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xs, gap: space.xs },
  spacer: { width: space.md },
  titles: { flex: 1, paddingHorizontal: space.xs },
  subtitle: { color: '#C9D3F5', marginTop: 1 },
});
