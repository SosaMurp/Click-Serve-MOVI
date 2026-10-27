import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, Icon, IconButton, Pill, radius, space, Text } from '../../design';
import { fileUrl } from '../../api/client';
import type { Evidencia } from '../../api/types';
import { formatDateTime } from '../../lib/format';

type Photo = { url: string; label?: string };

// Visor a pantalla completa con anterior/siguiente (la "lupa" de RF-65).
export function PhotoViewer({ items, index, onClose, onIndex }: { items: Photo[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const insets = useSafeAreaInsets();
  const current = index !== null ? items[index] : null;
  return (
    <Modal visible={index !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.viewer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.viewerBar}>
          <Text variant="label" tone="onColor" style={styles.flex}>{current?.label || `Foto ${(index ?? 0) + 1} de ${items.length}`}</Text>
          <IconButton icon="x" label="Cerrar" tint={color.inkOnColor} onPress={onClose} />
        </View>
        {current ? <Image source={{ uri: fileUrl(current.url) || undefined }} style={styles.full} resizeMode="contain" accessibilityLabel={current.label || 'Foto'} /> : null}
        {items.length > 1 ? (
          <View style={styles.nav}>
            <IconButton icon="chevron-left" label="Anterior" tint={color.inkOnColor} onPress={() => onIndex(((index ?? 0) - 1 + items.length) % items.length)} />
            <IconButton icon="chevron-right" label="Siguiente" tint={color.inkOnColor} onPress={() => onIndex(((index ?? 0) + 1) % items.length)} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

// Cuadrícula de miniaturas que abre el visor.
export function Gallery({ items, size = 88 }: { items: Photo[]; size?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length) return null;
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
      <PhotoViewer items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}

const TIPO: Record<string, { label: string; tone: 'brand' | 'accent' | 'success' }> = {
  ANTES: { label: 'Antes', tone: 'accent' },
  DURANTE: { label: 'Durante', tone: 'brand' },
  DESPUES: { label: 'Después', tone: 'success' },
  // Valores que guarda el backend.
  PRE_TRABAJO: { label: 'Antes', tone: 'accent' },
  EN_PROCESO: { label: 'Durante', tone: 'brand' },
  POST_TRABAJO: { label: 'Después', tone: 'success' },
};

// Evidencias como feed: foto grande, etiqueta de etapa y hora (RF-65/69).
export function EvidenceFeed({ items }: { items: Evidencia[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length) return null;
  const photos = items.map((e) => ({ url: e.url, label: `${TIPO[e.tipo_evidencia]?.label || e.tipo_evidencia}${e.descripcion ? ` · ${e.descripcion}` : ''}` }));
  return (
    <>
      {items.map((e, i) => {
        const t = TIPO[e.tipo_evidencia] || { label: e.tipo_evidencia, tone: 'brand' as const };
        return (
          <Pressable key={e.id_evidencia} accessibilityRole="imagebutton" accessibilityLabel={`Ver evidencia: ${photos[i].label}`} onPress={() => setOpen(i)} style={styles.feedCard}>
            <Image source={{ uri: fileUrl(e.url) || undefined }} style={styles.feedImg} resizeMode="cover" />
            <View style={styles.feedPill}><Pill label={t.label} tone={t.tone} size="sm" solid /></View>
            <View style={styles.feedText}>
              {e.descripcion ? <Text variant="body" numberOfLines={2}>{e.descripcion}</Text> : null}
              <Text variant="caption" tone="muted">{formatDateTime(e.fecha_subida)}</Text>
            </View>
          </Pressable>
        );
      })}
      <PhotoViewer items={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
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
  feedCard: { backgroundColor: color.surface, borderRadius: radius.lg, overflow: 'hidden', marginBottom: space.md },
  feedImg: { width: '100%', height: 200, backgroundColor: color.groundAlt },
  feedPill: { position: 'absolute', top: space.md, left: space.md },
  feedText: { padding: space.md, gap: 2 },
});
