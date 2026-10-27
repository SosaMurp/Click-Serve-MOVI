import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Banner, Button, color, Icon, IconName, radius, Screen, space, Text, TextField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import { INCIDENCIA_TIPOS } from '@/src/lib/estado';
import { hapticWarning } from '@/src/lib/media';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

// RF-101-104: reportar un problema o reclamar la garantía; la orden queda suspendida sin cobro.
export default function Incidencia() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s } = useSolicitud(id);
  const [tipo, setTipo] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [sending, setSending] = useState(false);
  const finalizada = s?.estado === 'FINALIZADA';
  const tipos = INCIDENCIA_TIPOS.filter((t) => (finalizada ? ['GARANTIA', 'MALA_CALIDAD', 'DANOS', 'OTRO'] : INCIDENCIA_TIPOS.map((x) => x.value).filter((v) => v !== 'GARANTIA')).includes(t.value));

  async function submit() {
    if (!tipo) return;
    setSending(true);
    try {
      const r = await solicitudesApi.reportar(id, tipo, descripcion.trim());
      hapticWarning();
      toast.success(`${r.mensaje} Folio ${r.incidencia.folio}.`);
      goBack(router);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<AppBar title={finalizada ? 'Garantía o reporte' : 'Reportar un problema'} subtitle={s?.folio} confirmDiscard={!!descripcion} />}
      footer={<Button title="Enviar reporte" icon="send" onPress={submit} loading={sending} disabled={!tipo || descripcion.trim().length < 10} full size="lg" />}
    >
      <Banner
        tone="info"
        title="No se te cobra mientras revisamos"
        body={finalizada ? 'Tu servicio tiene 90 días de garantía. Revisamos el caso con el técnico.' : 'La orden queda en pausa y podrás elegir otro técnico, continuar o cancelar sin cargo.'}
      />
      <Text variant="title" style={styles.title}>¿Qué pasó?</Text>
      <View style={styles.grid} accessibilityRole="radiogroup">
        {tipos.map((t) => {
          const on = tipo === t.value;
          return (
            <Pressable key={t.value} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setTipo(t.value)} style={[styles.option, on && styles.optionOn]}>
              <View style={[styles.icon, { backgroundColor: on ? color.surface : color.warningSoft }]}>
                <Icon name={t.icon as IconName} size={18} color={color.warningInk} />
              </View>
              <Text variant="subtitle" style={styles.flex}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.title}>
        <TextField
          label="Cuéntanos los detalles"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          maxLength={1000}
          counter
          placeholder="Qué ocurrió, cuándo y qué esperas que hagamos"
          helper="Mínimo 10 caracteres."
        />
      </View>
      <Text variant="caption" tone="muted">Si estás en peligro usa el botón SOS de la orden o llama al 911.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { marginTop: space.xl, marginBottom: space.md },
  grid: { gap: space.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, padding: space.md, borderRadius: radius.md, backgroundColor: color.surface, borderWidth: 2, borderColor: 'transparent' },
  optionOn: { borderColor: color.accent, backgroundColor: color.accentSoft },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
