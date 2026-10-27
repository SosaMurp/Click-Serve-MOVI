import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './Button';
import { Text } from './Text';
import { color, radius, space } from './tokens';

type Props = { visible: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode };

// Hoja inferior de Material 3 para elegir o capturar algo sin salir de la pantalla.
export function Sheet({ visible, onClose, title, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav} pointerEvents="box-none">
          <View style={[styles.panel, { paddingBottom: insets.bottom + space.lg, maxHeight: height * 0.88 }]} accessibilityViewIsModal>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text variant="title" style={styles.flex} accessibilityRole="header">{title}</Text>
              <IconButton icon="x" label="Cerrar" onPress={onClose} />
            </View>
            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.scrim, justifyContent: 'flex-end' },
  kav: { width: '100%', alignItems: 'center' },
  panel: { width: '100%', maxWidth: 640, backgroundColor: color.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: color.lineStrong, marginTop: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.xl, paddingRight: space.sm, paddingTop: space.xs },
  flex: { flex: 1 },
  body: { flexGrow: 0, flexShrink: 1 },
  bodyContent: { paddingHorizontal: space.xl, paddingBottom: space.md },
  footer: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.sm },
});
