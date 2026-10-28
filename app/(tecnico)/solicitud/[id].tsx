import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Banner, Button, color, Icon, Pill, radius, Screen, SectionHeader, Skeleton, space, Surface, Text } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import { formatDateTime, formatDistance, formatShortDate, formatTime12 } from '@/src/lib/format';
import { hapticSuccess } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { MapView } from '@/src/features/map/MapView';
import { Gallery } from '@/src/features/orders/Gallery';
import { useSolicitud } from '@/src/features/orders/hooks';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-58/59: detalle de una solicitud nueva antes de aceptarla (zona aproximada, sin datos de contacto).
export default function SolicitudNueva() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { data: s, loading, error } = useSolicitud(id);
  const [busy, setBusy] = useState<string | null>(null);

  // Si ya es mía (la acepté) o la tomó otro, esta pantalla no aplica.
  useEffect(() => {
    if (s?.es_tecnico_asignado) router.replace({ pathname: '/trabajo/[id]', params: { id: String(s.id_solicitud) } });
  }, [s, router]);

  async function accept() {
    setBusy('a');
    try {
      await solicitudesApi.aceptar(id);
      hapticSuccess();
      toast.success('Solicitud aceptada. Avisa cuando vayas en camino.');
      router.replace({ pathname: '/trabajo/[id]', params: { id } });
    } catch (e) {
      toast.error(errorMessage(e));
      setBusy(null);
    }
  }

  async function discard() {
    const ok = await dialog.confirm({ title: '¿Descartar esta solicitud?', message: 'Ya no te aparecerá en la lista.', confirmText: 'Descartar' });
    if (!ok) return;
    setBusy('d');
    try {
      await solicitudesApi.descartar(id);
      goBack(router);
    } catch (e) {
      toast.error(errorMessage(e));
      setBusy(null);
    }
  }

  const disponible = s?.estado === 'PENDIENTE';
  return (
    <Screen
      header={<AppBar title="Solicitud nueva" subtitle={s?.folio} fallbackHref="/trabajos" />}
      footer={s && disponible ? (
        <View style={styles.footer}>
          <Button title="Descartar" variant="outlined" onPress={discard} loading={busy === 'd'} disabled={!!busy} style={styles.flex} />
          <Button variant="accent" title="Aceptar trabajo" icon="check" onPress={accept} loading={busy === 'a'} disabled={!!busy || !user?.aprobado} size="lg" style={styles.flex2} />
        </View>
      ) : undefined}
    >
      {loading ? <Skeleton height={260} /> : null}
      {error && !s ? <Banner tone="error" title="Esta solicitud ya no está disponible" body={error} /> : null}
      {s ? (
        <>
          {!disponible ? <Banner tone="info" title="Ya no está disponible" body="Otro técnico la aceptó o el cliente la canceló." style={styles.gap} /> : null}
          {s.propuesta_a_mi || s.tecnico_propuesto === user?.id_usuario ? <Banner tone="success" title="El cliente te eligió a ti" body="Tienes 10 minutos para aceptarla antes de que se ofrezca a otros técnicos." style={styles.gap} /> : null}

          <Surface tint="peach">
            <View style={styles.head}>
              <View style={styles.catIcon}><Icon name="tool" size={22} color={color.inkOnColor} /></View>
              <View style={styles.flex}>
                <Text variant="caption" tone="muted">{s.folio}</Text>
                <Text variant="headline">{s.categoria_nombre}</Text>
              </View>
              <Pill label="Nueva" tone="accent" size="sm" />
            </View>
            <Text variant="body" style={styles.desc}>{s.descripcion}</Text>
          </Surface>

          <View style={styles.facts}>
            <Fact icon="navigation" label="Distancia" value={formatDistance(s.distancia_km)} />
            <Fact icon="calendar" label="Cuándo" value={s.fecha_preferida ? `${formatShortDate(s.fecha_preferida)}${s.hora_preferida ? ` · ${formatTime12(s.hora_preferida)}` : ''}` : 'Lo antes posible'} />
            <Fact icon="user" label="Cliente" value={`${s.cliente_nombre || 'Cliente'} ${s.cliente_apellido || ''}`.trim()} />
          </View>

          {s.latitud_aprox != null && s.longitud_aprox != null ? (
            <>
              <SectionHeader title="Zona aproximada" />
              <View style={styles.map}>
                <MapView center={{ lat: Number(s.latitud_aprox), lng: Number(s.longitud_aprox) }} zoom={14} height={180} markers={[{ id: 'zona', lat: Number(s.latitud_aprox), lng: Number(s.longitud_aprox), kind: 'solicitud', label: s.zona || 'Zona' }]} />
              </View>
              <Text variant="caption" tone="muted" style={styles.note}>La dirección exacta y el teléfono del cliente aparecen al aceptar.</Text>
            </>
          ) : s.zona ? <Text variant="body" tone="soft" style={styles.gap}>Zona: {s.zona}</Text> : null}

          {s.imagenes?.length ? (
            <>
              <SectionHeader title="Fotos del cliente" />
              <Gallery items={s.imagenes.map((im, i) => ({ url: im.url, label: `Foto ${i + 1}` }))} size={96} />
            </>
          ) : null}
          <Text variant="caption" tone="muted" style={styles.note}>Publicada {formatDateTime(s.fecha_creacion)}</Text>
        </>
      ) : null}
    </Screen>
  );
}

function Fact({ icon, label, value }: { icon: 'navigation' | 'calendar' | 'user'; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Icon name={icon} size={18} color={color.brandInk} />
      <Text variant="caption" tone="muted">{label}</Text>
      <Text variant="label" numberOfLines={2} align="center">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  gap: { marginBottom: space.md },
  footer: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  catIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' },
  desc: { marginTop: space.md },
  facts: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  fact: { flex: 1, backgroundColor: color.surface, borderRadius: radius.md, padding: space.md, alignItems: 'center', gap: 4 },
  map: { borderRadius: radius.md, overflow: 'hidden' },
  note: { marginTop: space.sm },
});
