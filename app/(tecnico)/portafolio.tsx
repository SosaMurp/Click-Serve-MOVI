import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppBar, Button, color, EmptyState, IconButton, radius, Screen, Sheet, SkeletonList, space, Text, TextField } from '@/src/design';
import { errorMessage, fileUrl } from '@/src/api/client';
import { tecnicoApi } from '@/src/api/endpoints';
import type { ItemPortafolio, LocalFile } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { MediaPermissionError, pickImages } from '@/src/lib/media';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-24: portafolio de trabajos anteriores, visible en el perfil público.
export default function Portafolio() {
  const { data, loading, setData, reload } = useLoader(() => tecnicoApi.portafolio().then((r) => r.portafolio), []);
  const [foto, setFoto] = useState<LocalFile | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);

  async function pick() {
    try {
      const [img] = await pickImages({ max: 1 });
      if (img) setFoto(img);
    } catch (e) {
      toast.error(e instanceof MediaPermissionError ? e.message : 'No se pudo cargar la foto.');
    }
  }

  async function save() {
    if (!foto || titulo.trim().length < 3) return;
    setSaving(true);
    try {
      const { item } = await tecnicoApi.agregarPortafolio(foto, titulo.trim(), descripcion.trim() || undefined);
      setData((prev) => [item, ...(prev || [])]);
      setFoto(null);
      setTitulo('');
      setDescripcion('');
      toast.success('Trabajo agregado al portafolio.');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(it: ItemPortafolio) {
    const ok = await dialog.confirm({ title: `¿Quitar "${it.titulo}"?`, confirmText: 'Quitar', destructive: true });
    if (!ok) return;
    try {
      await tecnicoApi.quitarPortafolio(it.id_item);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const list = data || [];
  return (
    <Screen header={<AppBar title="Portafolio" />} footer={<Button title="Agregar trabajo" icon="plus" onPress={pick} full size="lg" />}>
      <Text variant="body" tone="soft" style={styles.intro}>Muestra tus mejores trabajos: los clientes los ven antes de elegirte.</Text>
      {loading ? <SkeletonList rows={2} /> : null}
      {!loading && !list.length ? <EmptyState icon="image" title="Tu portafolio está vacío" body="Agrega fotos de trabajos terminados con una breve descripción." /> : null}
      <View style={styles.grid}>
        {list.map((it) => (
          <View key={it.id_item} style={styles.card}>
            <Image source={{ uri: fileUrl(it.url) || undefined }} style={styles.img} accessibilityLabel={it.titulo} />
            <View style={styles.cardText}>
              <Text variant="subtitle" numberOfLines={1} style={styles.flex}>{it.titulo}</Text>
              <IconButton icon="trash-2" label={`Quitar ${it.titulo}`} size={18} onPress={() => remove(it)} />
            </View>
            {it.descripcion ? <Text variant="caption" tone="muted" numberOfLines={2} style={styles.desc}>{it.descripcion}</Text> : null}
          </View>
        ))}
      </View>

      <Sheet visible={!!foto} onClose={() => setFoto(null)} title="Nuevo trabajo" footer={<Button title="Guardar" icon="check" onPress={save} loading={saving} disabled={titulo.trim().length < 3} full />}>
        {foto ? <Image source={{ uri: foto.uri }} style={styles.preview} /> : null}
        <TextField label="Título" value={titulo} onChangeText={setTitulo} maxLength={100} placeholder="Instalación de centro de carga" />
        <TextField label="Descripción (opcional)" value={descripcion} onChangeText={setDescripcion} maxLength={300} multiline />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { marginBottom: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: color.surface, borderRadius: radius.lg, overflow: 'hidden' },
  img: { width: '100%', aspectRatio: 1, backgroundColor: color.groundAlt },
  cardText: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.md },
  desc: { paddingHorizontal: space.md, paddingBottom: space.md },
  preview: { width: '100%', height: 180, borderRadius: radius.md, marginBottom: space.md, backgroundColor: color.groundAlt },
});
