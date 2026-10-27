import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner, Button, DateField, Sheet, space, Text, TextField, TimeField } from '../../design';
import type { Reprogramacion } from '../../api/types';
import { solicitudesApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { formatDate, formatTime12 } from '../../lib/format';
import { toast } from '../../ui/toast';

const today = () => new Date().toISOString().slice(0, 10);

// RF-124/125: validar el nuevo horario, rechazarlo proponiendo otro o dejar la cita como estaba.
export function ReprogramCard({ r, onChanged }: { r: Reprogramacion; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [counter, setCounter] = useState(false);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');

  const respond = async (respuesta: 'ACEPTAR' | 'RECHAZAR' | 'CANCELAR', contra?: { fecha: string; hora: string; motivo?: string }) => {
    setBusy(respuesta);
    try {
      const res = await solicitudesApi.responderHorario(r.id_reprogramacion, respuesta, contra);
      toast.success(res.mensaje);
      setCounter(false);
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const when = `${formatDate(r.fecha)} a las ${formatTime12(r.hora)}`;
  if (r.propuesta_por_mi) {
    return (
      <Banner tone="info" title="Propusiste un nuevo horario" body={`${when}. Esperamos la respuesta de la otra parte.`}
        action={<Button title="Retirar propuesta" variant="text" onPress={() => respond('CANCELAR')} loading={busy === 'CANCELAR'} />} />
    );
  }
  return (
    <View>
      <Banner tone="warning" title="Te proponen otro horario" body={`${when}${r.motivo ? `. Motivo: ${r.motivo}` : ''}`}
        action={
          <View style={styles.actions}>
            <Button title="Aceptar" onPress={() => respond('ACEPTAR')} loading={busy === 'ACEPTAR'} />
            <Button title="Proponer otro" variant="outlined" onPress={() => setCounter(true)} />
            <Button title="Mantener mi cita" variant="text" onPress={() => respond('RECHAZAR')} loading={busy === 'RECHAZAR'} />
          </View>
        } />
      <Sheet visible={counter} onClose={() => setCounter(false)} title="Proponer otro horario"
        footer={<Button title="Enviar propuesta" full disabled={!fecha || !hora} loading={busy === 'RECHAZAR'} onPress={() => fecha && hora && respond('RECHAZAR', { fecha, hora, motivo: motivo || undefined })} />}>
        <Text variant="bodySm" tone="muted" style={styles.hint}>Rechazas el horario propuesto y envías uno distinto.</Text>
        <DateField label="Fecha" value={fecha} onChange={setFecha} min={today()} />
        <TimeField label="Hora" value={hora} onChange={setHora} />
        <TextField label="Motivo (opcional)" value={motivo} onChangeText={setMotivo} maxLength={300} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  hint: { marginBottom: space.md },
});
