import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, Icon, IconButton, radius, space, Text } from '../../design';
import { fileUrl } from '../../api/client';

// Galería de fotos con visor a pantalla completa (la "lupa" de RF-65).
export function Gallery({ items, size = 88 }: { items: { url: string; label?: string }[]; size?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  if (!items.length) return null;
  const current = open !== null ? items[open] : null;
  return (
    <>
      <View style={styles.grid}>
        {items.map((it, i) => (
          <Pressable key={it.url} accessibilityRole="imagebutton" accessibilityLabel={`Ver foto ${i + 1}${it.label ? `: ${it.label}` : ''}`} onPress={() => setOpen(i)} style={[styles.thumb, { width: size, height: size }]}>
            <Image source={{ uri: fileUrl(it.url) || undefined }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={styles.zoom}><Icon name="zoom-in" size={16} color={color.inkOnColor} /></View>
          </Pressable>
        ))}
      </View>
      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <View style={[styles.viewer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.viewerBar}>
            <Text variant="label" tone="onColor" style={styles.flex}>{current?.label || `Foto ${(open ?? 0) + 1} de ${items.length}`}</Text>
            <IconButton icon="x" label="Cerrar" tint={color.inkOnColor} onPress={() => setOpen(null)} />
          </View>
          {current ? <Image source={{ uri: fileUrl(current.url) || undefined }} style={styles.full} resizeMode="contain" accessibilityLabel={current.label || 'Foto'} /> : null}
          {items.length > 1 ? (
            <View style={styles.nav}>
              <IconButton icon="chevron-left" label="Anterior" tint={color.inkOnColor} onPress={() => setOpen((o) => ((o ?? 0) - 1 + items.length) % items.length)} />
              <IconButton icon="chevron-right" label="Siguiente" tint={color.inkOnColor} onPress={() => setOpen((o) => ((o ?? 0) + 1) % items.length)} />
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  thumb: { borderRadius: radius.sm, overflow: 'hidden', backgroundColor: color.groundAlt },
  zoom: { position: 'absolute', right: 4, bottom: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: 3 },
  viewer: { flex: 1, backgroundColor: '#0B0C10' },
  viewerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg },
  full: { flex: 1, width: '100%' },
  nav: { flexDirection: 'row', justifyContent: 'center', gap: space.xl, paddingVertical: space.md },
});
