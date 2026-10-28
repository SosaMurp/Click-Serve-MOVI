import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Button, color, Divider, IconButton, Money, radius, Screen, Segmented, space, Surface, Text, TextField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import { parseMoneyInput, sumMoney } from '@/src/lib/format';
import { hapticSuccess } from '@/src/lib/media';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

type Tipo = 'MANO_OBRA' | 'MATERIAL';
type Linea = { key: number; tipo: Tipo; descripcion: string; monto: string };
let seq = 0;
const nueva = (tipo: Tipo = 'MANO_OBRA'): Linea => ({ key: (seq += 1), tipo, descripcion: '', monto: '' });

// RF-72: cotización por conceptos con "+ AGREGAR OTRO CONCEPTO". El total final lo calcula el servidor.
export default function Cotizar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s } = useSolicitud(id);
  const [lineas, setLineas] = useState<Linea[]>([nueva('MANO_OBRA')]);
  const [detalles, setDetalles] = useState('');
  const [minutos, setMinutos] = useState('');
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Si ya hay una cotización enviada, se precarga para editarla.
  useEffect(() => {
    if (loaded || !s) return;
    setLoaded(true);
    if (s.cotizacion?.conceptos?.length) {
      setLineas(s.cotizacion.conceptos.filter((c) => c.tipo !== 'EXTRA').map((c) => ({ key: (seq += 1), tipo: c.tipo as Tipo, descripcion: c.descripcion, monto: c.monto })));
      setDetalles(s.cotizacion.detalles || '');
      setMinutos(s.cotizacion.tiempo_estimado_minutos ? String(s.cotizacion.tiempo_estimado_minutos) : '');
    }
  }, [s, loaded]);

  const parsed = lineas.map((l) => ({ ...l, value: parseMoneyInput(l.monto) }));
  const total = sumMoney(parsed.map((l) => l.value));
  const invalid = parsed.some((l) => !l.descripcion.trim() || !l.value);

  const update = (key: number, patch: Partial<Linea>) => setLineas((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  async function submit() {
    setTouched(true);
    if (invalid) { toast.warning('Completa la descripción y el monto de cada concepto.'); return; }
    setSending(true);
    try {
      await solicitudesApi.cotizar(id, parsed.map((l) => ({ tipo: l.tipo, descripcion: l.descripcion.trim(), monto: l.value as string })), detalles.trim(), minutos ? Number(minutos) : undefined);
      hapticSuccess();
      toast.success('Cotización enviada. Te avisamos cuando el cliente responda.');
      goBack(router);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Cotización" subtitle={s ? `${s.categoria_nombre} · ${s.folio}` : undefined} confirmDiscard={lineas.some((l) => l.descripcion || l.monto)} />}
      footer={(
        <View style={styles.footer}>
          <View style={styles.total}>
            <Text variant="caption" tone="muted">Total (IVA incluido)</Text>
            <Money value={total} size="lg" />
          </View>
          <Button variant="accent" title="Enviar al cliente" icon="send" onPress={submit} loading={sending} size="lg" style={styles.flex} />
        </View>
      )}
    >
      <Text variant="body" tone="soft" style={styles.intro}>Desglosa la mano de obra y cada material. El cliente aprueba antes de que empieces.</Text>
      {lineas.map((l, i) => {
        const p = parsed[i];
        return (
          <Surface key={l.key} style={styles.card}>
            <View style={styles.cardHead}>
              <Text variant="label" tone="muted" style={styles.flex}>Concepto {i + 1}</Text>
              {lineas.length > 1 ? <IconButton icon="trash-2" label={`Quitar concepto ${i + 1}`} size={18} onPress={() => setLineas((xs) => xs.filter((x) => x.key !== l.key))} /> : null}
            </View>
            <Segmented<Tipo> value={l.tipo} onChange={(v) => update(l.key, { tipo: v })} options={[{ value: 'MANO_OBRA', label: 'Mano de obra', icon: 'tool' }, { value: 'MATERIAL', label: 'Material', icon: 'package' }]} />
            <View style={styles.fields}>
              <TextField label="Descripción" value={l.descripcion} onChangeText={(v) => update(l.key, { descripcion: v })} placeholder={l.tipo === 'MANO_OBRA' ? 'Cambio de contacto y revisión del circuito' : 'Contacto doble polarizado'} maxLength={200} error={touched && !l.descripcion.trim() ? 'Escribe la descripción.' : null} />
              <TextField label="Monto (MXN)" value={l.monto} onChangeText={(v) => update(l.key, { monto: v.replace(/[^\d.,]/g, '') })} keyboardType="decimal-pad" icon="dollar-sign" placeholder="0.00" error={touched && !p.value ? 'Monto mayor a 0 con máximo 2 decimales.' : null} />
            </View>
          </Surface>
        );
      })}
      {lineas.length < 20 ? (
        <Button title="+ Agregar otro concepto" variant="tonal" onPress={() => setLineas((xs) => [...xs, nueva('MATERIAL')])} full style={styles.add} />
      ) : null}

      <Surface style={styles.card}>
        <TextField label="Notas para el cliente (opcional)" value={detalles} onChangeText={setDetalles} multiline maxLength={500} placeholder="Qué incluye, garantía de refacciones…" />
        <TextField label="Tiempo estimado (minutos)" value={minutos} onChangeText={(v) => setMinutos(v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" icon="clock" />
      </Surface>

      <Surface tint="sunk" style={styles.summary}>
        {(['MANO_OBRA', 'MATERIAL'] as Tipo[]).map((t) => (
          <View key={t} style={styles.sumRow}>
            <Text variant="bodySm" tone="soft" style={styles.flex}>{t === 'MANO_OBRA' ? 'Mano de obra' : 'Materiales'}</Text>
            <Money value={parsed.filter((l) => l.tipo === t).reduce((a, l) => a + (l.value ? Number(l.value) : 0), 0).toFixed(2)} size="sm" />
          </View>
        ))}
        <Divider />
        <Text variant="caption" tone="muted">De este total, Click & Serve retiene su comisión y las retenciones de ley; verás tu neto en la billetera.</Text>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { marginBottom: space.md },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  total: { minWidth: 120 },
  card: { marginBottom: space.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm, minHeight: 40 },
  fields: { marginTop: space.md },
  add: { marginBottom: space.lg, borderRadius: radius.full, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.brandMid },
  summary: { gap: space.xs },
  sumRow: { flexDirection: 'row', alignItems: 'center' },
});
