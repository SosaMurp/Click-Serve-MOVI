import React, { useEffect, useRef } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useIsFocused, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { IconButton } from './Button';
import { IconName } from './Icon';
import { Text } from './Text';
import { color, space } from './tokens';
import { dialog } from '../ui/dialog';
import { goBack as navGoBack } from '../lib/nav';

export type AppBarAction = { icon: IconName; label: string; onPress: () => void; badge?: number | boolean };

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

// Encabezado simple sobre el fondo claro: botón circular para regresar, título centrado y acciones circulares.
export function AppBar({ title, subtitle, back = true, onBack, confirmDiscard, actions = [], right, fallbackHref = '/' }: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const guard = back && !!confirmDiscard;

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
    navGoBack(router, fallbackHref);
  };
  const goBackRef = useRef(goBack);
  goBackRef.current = goBack;

  // RF-84 también para los gestos del sistema: el botón atrás de Android pasa por la misma pregunta
  // (solo en la pantalla visible) y el deslizar para regresar de iOS se apaga mientras haya cambios.
  // Las salidas por código después de guardar no se interceptan.
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !guard });
  }, [navigation, guard]);
  useEffect(() => {
    if (!guard || !focused || Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackRef.current();
      return true;
    });
    return () => sub.remove();
  }, [guard, focused]);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
      <StatusBar style="dark" />
      <View style={styles.inner}>
        {back ? (
          <View style={styles.side}>
            <CircleIcon icon="arrow-left" label="Regresar" onPress={goBack} />
          </View>
        ) : null}
        <View style={styles.titles}>
          <Text variant={back ? 'title' : 'headline'} numberOfLines={1} align={back ? 'center' : 'left'} accessibilityRole="header">{title}</Text>
          {subtitle ? <Text variant="caption" tone="muted" numberOfLines={1} align={back ? 'center' : 'left'}>{subtitle}</Text> : null}
        </View>
        <View style={[styles.side, styles.sideRight]}>
          {actions.map((a) => <CircleIcon key={a.label} icon={a.icon} label={a.label} onPress={a.onPress} badge={a.badge} />)}
          {right}
          {back && !actions.length && !right ? <View style={styles.placeholder} /> : null}
        </View>
      </View>
    </View>
  );
}

// Botón circular blanco con borde fino (encabezados).
export function CircleIcon({ icon, label, onPress, badge }: { icon: IconName; label: string; onPress?: () => void; badge?: number | boolean }) {
  return <IconButton icon={icon} label={label} onPress={onPress} background={color.surface} badge={badge} size={20} bordered />;
}

const styles = StyleSheet.create({
  bar: { backgroundColor: color.ground, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 640, minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, gap: space.sm },
  side: { minWidth: 48, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  sideRight: { justifyContent: 'flex-end' },
  titles: { flex: 1 },
  placeholder: { width: 48 },
});
