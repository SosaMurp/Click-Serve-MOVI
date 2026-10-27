import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Button, Chip, radius, Screen, space, SwitchRow, Text, TextField } from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { direccionesApi } from '@/src/api/endpoints';
import { onlyDigits } from '@/src/lib/validators';
import { currentLocation, LZC_CENTER } from '@/src/lib/media';
import { MapView } from '@/src/features/map/MapView';
import { toast } from '@/src/ui/toast';

const ETIQUETAS = ['Casa', 'Trabajo', 'Otro'];
type Field = 'calle' | 'numero' | 'cp' | 'colonia';

// RF-123: alta y edición de un domicilio con su punto exacto en el mapa.
export default function DireccionForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [f, setF] = useState({ etiqueta: 'Casa', calle: '', numero: '', interior: '', colonia: '', cp: '', ciudad: 'Lázaro Cárdenas', referencias: '' });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [principal, setPrincipal] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!id) return;
    direccionesApi.lista().then(({ direcciones }) => {
      const d = direcciones.find((x) => String(x.id_direccion) === id);
      if (!d) return;
      setF({ etiqueta: d.etiqueta, calle: d.calle, numero: d.numero, interior: d.interior || '', colonia: d.colonia, cp: d.cp, ciudad: d.ciudad, referencias: d.referencias || '' });
      setCoords(d.latitud && d.longitud ? { lat: Number(d.latitud), lng: Number(d.longitud) } : null);
      setPrincipal(d.predeterminada);
    }).catch(() => {});
  }, [id]);

  const set = (k: keyof typeof f) => (v: string) => {
    setF((x) => ({ ...x, [k]: k === 'cp' ? onlyDigits(v).slice(0, 5) : v }));
    setDirty(true);
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function locate() {
    const c = await currentLocation();
    if (!c) { toast.warning('No pudimos obtener tu ubicación; toca el mapa para marcar el punto.'); return; }
    setCoords({ lat: c.latitude, lng: c.longitude });
    setDirty(true);
  }

  async function save() {
    const e: Partial<Record<Field, string>> = {};
    if (f.calle.trim().length < 3) e.calle = 'Escribe la calle.';
    if (!f.numero.trim()) e.numero = 'Escribe el número exterior.';
    if (f.cp && f.cp.length !== 5) e.cp = 'El código postal tiene 5 dígitos.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const payload = { ...f, interior: f.interior || null, referencias: f.referencias || null, latitud: coords?.lat ?? null, longitud: coords?.lng ?? null, predeterminada: principal };
      if (id) await direccionesApi.editar(Number(id), payload);
      else await direccionesApi.crear(payload);
      toast.success('Dirección guardada.');
      goBack(router);
    } catch (err) {
      if (err instanceof ApiError && err.field) setErrors({ [err.field]: err.message });
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      header={<AppBar title={id ? 'Editar dirección' : 'Nueva dirección'} confirmDiscard={dirty} />}
      footer={<Button title="Guardar dirección" icon="check" onPress={save} loading={saving} full size="lg" />}
    >
      <Text variant="label" tone="soft" style={styles.label}>Nombre</Text>
      <View style={styles.chips}>
        {ETIQUETAS.map((e) => <Chip key={e} label={e} icon={e === 'Trabajo' ? 'briefcase' : e === 'Casa' ? 'home' : 'map-pin'} selected={f.etiqueta === e} onPress={() => set('etiqueta')(e)} />)}
      </View>
      <TextField label="Calle" value={f.calle} onChangeText={set('calle')} error={errors.calle} maxLength={255} autoComplete="address-line1" />
      <View style={styles.row}>
        <View style={styles.flex}><TextField label="Número" value={f.numero} onChangeText={set('numero')} error={errors.numero} maxLength={50} /></View>
        <View style={styles.flex}><TextField label="Interior" value={f.interior} onChangeText={set('interior')} maxLength={50} /></View>
      </View>
      <TextField label="Colonia" value={f.colonia} onChangeText={set('colonia')} maxLength={100} />
      <View style={styles.row}>
        <View style={styles.flex}><TextField label="C.P." value={f.cp} onChangeText={set('cp')} error={errors.cp} keyboardType="number-pad" maxLength={5} autoComplete="postal-code" /></View>
        <View style={styles.flex2}><TextField label="Ciudad" value={f.ciudad} onChangeText={set('ciudad')} maxLength={100} /></View>
      </View>
      <TextField label="Referencias (opcional)" value={f.referencias} onChangeText={set('referencias')} multiline maxLength={300} placeholder="Color de la fachada, entre calles…" />

      <Text variant="label" tone="soft" style={styles.label}>Punto en el mapa</Text>
      <View style={styles.map}>
        <MapView
          center={coords || { lat: LZC_CENTER.latitude, lng: LZC_CENTER.longitude }}
          zoom={coords ? 16 : 13}
          height={200}
          pickable
          markers={coords ? [{ id: 'punto', lat: coords.lat, lng: coords.lng, kind: 'punto', label: f.etiqueta, draggable: true }] : []}
          onPick={(lat, lng) => { setCoords({ lat, lng }); setDirty(true); }}
        />
      </View>
      <Button title="Usar mi ubicación actual" icon="crosshair" variant="tonal" onPress={locate} full style={styles.mt} />
      <SwitchRow label="Usar como dirección principal" value={principal} onChange={(v) => { setPrincipal(v); setDirty(true); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  row: { flexDirection: 'row', gap: space.md },
  label: { marginBottom: space.sm, marginTop: space.sm },
  chips: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  map: { borderRadius: radius.md, overflow: 'hidden' },
  mt: { marginTop: space.md },
});
