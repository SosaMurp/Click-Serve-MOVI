import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Avatar, Button, Chip, RatingStars, Screen, space, Surface, Text, TextField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import { hapticSuccess } from '@/src/lib/media';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

const RAPIDOS = ['Puntual', 'Amable', 'Explicó bien la falla', 'Pagó sin problema', 'Lugar accesible'];

// RF-43: calificación bidireccional, el técnico califica al cliente.
export default function CalificarCliente() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s } = useSolicitud(id);
  const [estrellas, setEstrellas] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    setSending(true);
    try {
      const r = await solicitudesApi.calificarCliente(id, estrellas, [tags.join(', '), comentario.trim()].filter(Boolean).join('. '));
      hapticSuccess();
      toast.success(r.mensaje || 'Gracias por calificar.');
      goBack(router);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Califica al cliente" confirmDiscard={estrellas > 0 || !!comentario} />}
      footer={<Button title="Enviar calificación" icon="send" onPress={submit} loading={sending} disabled={!estrellas} full size="lg" />}
    >
      <Surface tint="sky" style={styles.hero}>
        <Avatar nombre={s?.cliente_nombre} apellido={s?.cliente_apellido} size={72} ring />
        <Text variant="headline" align="center">¿Cómo fue trabajar con {s?.cliente_nombre || 'el cliente'}?</Text>
        <Text variant="bodySm" tone="soft" align="center">{s?.categoria_nombre} · {s?.folio}</Text>
        <View style={styles.stars}><RatingStars value={estrellas} onChange={setEstrellas} size={44} label="Calificación del cliente" /></View>
      </Surface>
      <Text variant="title" style={styles.title}>¿Qué destacas?</Text>
      <View style={styles.chips}>
        {RAPIDOS.map((r) => <Chip key={r} label={r} selected={tags.includes(r)} onPress={() => setTags((x) => (x.includes(r) ? x.filter((y) => y !== r) : [...x, r]))} />)}
      </View>
      <View style={styles.title}>
        <TextField label="Comentario (opcional)" value={comentario} onChangeText={setComentario} multiline maxLength={400} counter />
      </View>
      <Text variant="caption" tone="muted">Tu calificación ayuda a Click & Serve a cuidar a la comunidad de técnicos.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  stars: { marginTop: space.sm },
  title: { marginTop: space.xl, marginBottom: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
