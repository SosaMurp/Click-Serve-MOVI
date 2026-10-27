import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar, Banner, Button, Chip, color, Icon, IconButton, radius, Screen, space, Text, TextField } from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { soporteApi } from '@/src/api/endpoints';
import type { LocalFile } from '@/src/api/types';
import { pickDocument } from '@/src/lib/media';
import { toast } from '@/src/ui/toast';

const CATEGORIAS = [
  { value: 'SERVICIO', label: 'Un servicio', icon: 'tool' },
  { value: 'PAGOS', label: 'Pagos', icon: 'credit-card' },
  { value: 'CUENTA', label: 'Mi cuenta', icon: 'user' },
  { value: 'SEGURIDAD', label: 'Seguridad', icon: 'shield' },
  { value: 'OTRO', label: 'Otro', icon: 'more-horizontal' },
] as const;

// RF-107/94/108: abrir un caso de soporte con adjunto opcional y ligado a una orden.
export default function NuevoTicket() {
  const { solicitud } = useLocalSearchParams<{ solicitud?: string }>();
  const router = useRouter();
  const [categoria, setCategoria] = useState<string>(solicitud ? 'SERVICIO' : 'OTRO');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [adjunto, setAdjunto] = useState<LocalFile | null>(null);
  const [errors, setErrors] = useState<{ asunto?: string; mensaje?: string }>({});
  const [sending, setSending] = useState(false);

  async function submit() {
    const e: typeof errors = {};
    if (asunto.trim().length < 3) e.asunto = 'Escribe el asunto de tu caso.';
    if (mensaje.trim().length < 5) e.mensaje = 'Cuéntanos con más detalle qué necesitas.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSending(true);
    try {
      const r = await soporteApi.crear({ asunto: asunto.trim(), categoria, mensaje: mensaje.trim(), id_solicitud: solicitud ? Number(solicitud) : null }, adjunto);
      toast.success(r.mensaje);
      router.replace({ pathname: '/soporte/[id]', params: { id: String(r.ticket.id_ticket) } });
    } catch (err) {
      if (err instanceof ApiError && err.field) setErrors({ [err.field]: err.message });
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Nuevo caso" confirmDiscard={!!(asunto || mensaje)} />}
      footer={<Button title="Enviar caso" icon="send" onPress={submit} loading={sending} full size="lg" />}
    >
      {solicitud ? <Banner tone="info" title="Ligado a tu orden" body="El asesor verá el detalle del servicio." style={styles.gap} /> : null}
      <Text variant="label" tone="soft" style={styles.label}>Tema</Text>
      <View style={styles.chips}>
        {CATEGORIAS.map((c) => <Chip key={c.value} label={c.label} icon={c.icon} selected={categoria === c.value} onPress={() => setCategoria(c.value)} />)}
      </View>
      {categoria === 'SEGURIDAD' ? <Banner tone="error" title="Prioridad alta" body="Si estás en peligro llama al 911 además de abrir el caso." style={styles.gap} /> : null}
      <TextField label="Asunto" value={asunto} onChangeText={(v) => { setAsunto(v); setErrors((x) => ({ ...x, asunto: undefined })); }} maxLength={150} error={errors.asunto} />
      <TextField label="Mensaje" value={mensaje} onChangeText={(v) => { setMensaje(v); setErrors((x) => ({ ...x, mensaje: undefined })); }} multiline maxLength={2000} counter error={errors.mensaje} placeholder="Describe lo que pasó; si aplica, incluye fechas y montos." />
      {adjunto ? (
        <View style={styles.file}>
          <Icon name={adjunto.type.startsWith('image/') ? 'image' : 'file-text'} size={18} color={color.brandInk} />
          <Text variant="label" numberOfLines={1} style={styles.flex}>{adjunto.name}</Text>
          <IconButton icon="x" label="Quitar adjunto" size={18} onPress={() => setAdjunto(null)} />
        </View>
      ) : (
        <Button title="Adjuntar foto o PDF" icon="paperclip" variant="tonal" onPress={async () => { const d = await pickDocument().catch(() => null); if (d) setAdjunto(d); }} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginBottom: space.md },
  label: { marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.lg },
  file: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.brandSoft, borderRadius: radius.md, paddingLeft: space.md },
});
