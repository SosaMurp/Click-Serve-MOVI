import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Avatar, Button, Chip, RatingStars, Screen, space, Surface, Text, TextField } from '@/src/design';
import { errorMessage, fileUrl } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import { hapticSuccess } from '@/src/lib/media';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

const RAPIDOS = ['Puntual', 'Amable', 'Trabajo limpio', 'Explicó todo', 'Buen precio'];
const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

// RF-55: calificar al técnico después del servicio.
export default function Calificar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s } = useSolicitud(id);
  const [estrellas, setEstrellas] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);
  const t = s?.tecnico;

  async function submit() {
    setSending(true);
    try {
      const texto = [tags.join(', '), comentario.trim()].filter(Boolean).join('. ');
      const r = await solicitudesApi.calificar(id, estrellas, texto);
      hapticSuccess();
      toast.success(r.mensaje || '¡Gracias por tu calificación!');
      goBack(router);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Califica el servicio" confirmDiscard={estrellas > 0 || !!comentario} />}
      footer={<Button title="Enviar calificación" icon="send" onPress={submit} loading={sending} disabled={!estrellas} full size="lg" />}
    >
      <Surface tint="sky" style={styles.hero}>
        {t ? <Avatar uri={fileUrl(t.foto_url)} nombre={t.nombre} apellido={t.apellido} size={72} ring /> : null}
        <Text variant="headline" align="center">¿Cómo te fue con {t?.nombre || 'tu técnico'}?</Text>
        <Text variant="bodySm" tone="soft" align="center">{s?.categoria_nombre} · {s?.folio}</Text>
        <View style={styles.stars}><RatingStars value={estrellas} onChange={setEstrellas} size={44} label="Calificación" /></View>
        <Text variant="label" tone="brand">{LABELS[estrellas] || 'Toca una estrella'}</Text>
      </Surface>

      <Text variant="title" style={styles.title}>¿Qué destacas?</Text>
      <View style={styles.chips}>
        {RAPIDOS.map((r) => (
          <Chip key={r} label={r} selected={tags.includes(r)} onPress={() => setTags((x) => (x.includes(r) ? x.filter((y) => y !== r) : [...x, r]))} />
        ))}
      </View>
      <View style={styles.title}>
        <TextField label="Comentario (opcional)" value={comentario} onChangeText={setComentario} multiline maxLength={400} counter placeholder="Cuéntale a otros clientes cómo fue" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  stars: { marginTop: space.sm },
  title: { marginTop: space.xl, marginBottom: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
