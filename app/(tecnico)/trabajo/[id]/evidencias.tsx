import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Button, color, Icon, radius, Screen, Segmented, space, Text, TextField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import type { LocalFile } from '@/src/api/types';
import { hapticSuccess, MediaPermissionError, pickImages } from '@/src/lib/media';
import { EvidenceFeed } from '@/src/features/orders/Gallery';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

type Etapa = 'ANTES' | 'DURANTE' | 'DESPUES';
const MAX = 5;

// RF-65: documentar el trabajo con fotos por etapa (comprimidas antes de subir).
export default function Evidencias() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s, reload } = useSolicitud(id);
  const [etapa, setEtapa] = useState<Etapa>('DESPUES');
  const [fotos, setFotos] = useState<LocalFile[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [sending, setSending] = useState(false);

  async function add(camera: boolean) {
    try {
      const picked = await pickImages({ camera, multiple: !camera, max: MAX - fotos.length });
      if (picked.length) setFotos((f) => [...f, ...picked].slice(0, MAX));
    } catch (e) {
      toast.error(e instanceof MediaPermissionError ? e.message : 'No se pudo cargar la foto.');
    }
  }

  async function upload() {
    if (!fotos.length) return;
    setSending(true);
    try {
      await solicitudesApi.subirEvidencias(id, fotos, etapa, descripcion.trim() || undefined);
      hapticSuccess();
      toast.success(`${fotos.length} foto${fotos.length > 1 ? 's' : ''} subida${fotos.length > 1 ? 's' : ''}.`);
      setFotos([]);
      setDescripcion('');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Evidencia del trabajo" subtitle={s?.folio} confirmDiscard={fotos.length > 0} />}
      footer={fotos.length ? (
        <Button title={`Subir ${fotos.length} foto${fotos.length > 1 ? 's' : ''}`} icon="upload" onPress={upload} loading={sending} full size="lg" />
      ) : (s?.evidencias?.length ? <Button title="Listo" icon="check" variant="filled" onPress={() => goBack(router)} full size="lg" /> : undefined)}
    >
      <Text variant="label" tone="soft" style={styles.label}>Etapa</Text>
      <Segmented<Etapa> value={etapa} onChange={setEtapa} options={[{ value: 'ANTES', label: 'Antes' }, { value: 'DURANTE', label: 'Durante' }, { value: 'DESPUES', label: 'Después' }]} />

      <View style={styles.grid}>
        {fotos.map((f, i) => (
          <View key={f.uri} style={styles.thumb}>
            <Image source={{ uri: f.uri }} style={styles.img} accessibilityLabel={`Foto ${i + 1}`} />
            <Pressable accessibilityRole="button" accessibilityLabel={`Quitar foto ${i + 1}`} onPress={() => setFotos((x) => x.filter((_, j) => j !== i))} style={styles.remove} hitSlop={8}>
              <Icon name="x" size={14} color={color.inkOnColor} />
            </Pressable>
          </View>
        ))}
        {fotos.length < MAX ? (
          <>
            <Pressable accessibilityRole="button" accessibilityLabel="Tomar foto" onPress={() => add(true)} style={styles.addTile}>
              <Icon name="camera" size={26} color={color.brandInk} />
              <Text variant="caption" tone="brand">Cámara</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Elegir de la galería" onPress={() => add(false)} style={styles.addTile}>
              <Icon name="image" size={26} color={color.brandInk} />
              <Text variant="caption" tone="brand">Galería</Text>
            </Pressable>
          </>
        ) : null}
      </View>
      {fotos.length ? <TextField label="Descripción (opcional)" value={descripcion} onChangeText={setDescripcion} maxLength={300} placeholder="Qué se ve en estas fotos" /> : null}
      <Text variant="caption" tone="muted">Hasta {MAX} fotos por envío. Se comprimen para subir rápido con datos móviles.</Text>

      {s?.evidencias?.length ? (
        <>
          <Text variant="title" style={styles.title}>Subidas ({s.evidencias.length})</Text>
          <EvidenceFeed items={s.evidencias} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginVertical: space.lg },
  thumb: { width: 104, height: 104, borderRadius: radius.md, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  remove: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(15,30,46,0.7)', alignItems: 'center', justifyContent: 'center' },
  addTile: { width: 104, height: 104, borderRadius: radius.md, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center', gap: 4 },
  title: { marginTop: space.xl, marginBottom: space.md },
});
