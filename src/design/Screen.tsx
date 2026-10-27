import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, space } from './tokens';

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  background?: string;
  contentStyle?: ViewStyle;
  // En una pestaña la barra de navegación inferior ya respeta el borde inferior.
  inTabs?: boolean;
};

// Contenedor de pantalla: cabecera fija, contenido desplazable con "jalar para actualizar"
// y un pie fijo para la acción principal. En web el contenido se centra a ancho de teléfono.
export function Screen({ children, header, footer, scroll = true, refreshing = false, onRefresh, padded = true, background = color.ground, contentStyle, inTabs }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = inTabs ? 0 : insets.bottom;
  const inner = [styles.content, padded && styles.padded, contentStyle];

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: footer ? space.xl : bottom + space.xxl }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[color.brand]} tintColor={color.brand} /> : undefined}
    >
      <View style={inner}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.center]}><View style={[inner, styles.flex]}>{children}</View></View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: background }]}>
      {header}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: bottom + space.md }]}>
            <View style={styles.footerInner}>{footer}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const MAX = 640;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center' },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: MAX },
  padded: { paddingHorizontal: space.lg, paddingTop: space.lg },
  footer: { borderTopWidth: 1, borderTopColor: color.line, backgroundColor: color.surface, paddingTop: space.md, alignItems: 'center' },
  footerInner: { width: '100%', maxWidth: MAX, paddingHorizontal: space.lg, gap: space.sm },
});
