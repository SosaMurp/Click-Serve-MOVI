import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Banner, Button, Calendar, Chip, Screen, space, Surface, Text, TextField, TimeField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import { formatDate, formatTime12 } from '@/src/lib/format';
import { hapticSuccess } from '@/src/lib/media';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

const MOTIVOS = ['Surgió un imprevisto', 'No estaré en casa', 'Necesito más tiempo', 'Clima'];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// RF-63/64/124: proponer otro día y hora; la otra parte acepta, rechaza o contrapropone.
export default function Reprogramar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s } = useSolicitud(id);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!fecha || !hora) return;
    setSending(true);
    try {
      const r = await solicitudesApi.proponerHorario(id, fecha, hora, motivo.trim() || undefined);
      hapticSuccess();
      toast.success(r.mensaje);
      goBack(router);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Cambiar fecha u hora" subtitle={s?.folio} confirmDiscard={!!(fecha || hora || motivo)} />}
      footer={<Button title={fecha && hora ? `Proponer ${formatDate(fecha)}, ${formatTime12(hora)}` : 'Elige día y hora'} icon="send" onPress={submit} loading={sending} disabled={!fecha || !hora} full size="lg" />}
    >
      {s?.fecha_preferida ? (
        <Banner tone="info" title="Cita actual" body={`${formatDate(s.fecha_preferida)}${s.hora_preferida ? ` a las ${formatTime12(s.hora_preferida)}` : ''}. Se mantiene hasta que la otra parte acepte el cambio.`} />
      ) : <Banner tone="info" title="La otra parte debe aceptar" body="Mientras tanto la cita se mantiene como está." />}
      <Text variant="title" style={styles.title}>Nuevo día</Text>
      <Surface><Calendar value={fecha} min={todayIso()} onPick={setFecha} /></Surface>
      <Text variant="title" style={styles.title}>Nueva hora</Text>
      <TimeField label="Hora" value={hora} onChange={setHora} />
      <Text variant="title" style={styles.titleSm}>Motivo (opcional)</Text>
      <Surface style={styles.chipsWrap}>
        {MOTIVOS.map((m) => <Chip key={m} label={m} selected={motivo === m} onPress={() => setMotivo(motivo === m ? '' : m)} />)}
      </Surface>
      <TextField label="Otro motivo" value={MOTIVOS.includes(motivo) ? '' : motivo} onChangeText={setMotivo} maxLength={300} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: space.xl, marginBottom: space.md },
  titleSm: { marginTop: space.sm, marginBottom: space.md },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
});
