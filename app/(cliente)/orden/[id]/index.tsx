import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppBar, Banner, Button, Collapsible, color, Divider, Icon, ListItem, Money, radius, Screen, SectionHeader, Skeleton, space, Steps, Surface, Text,
} from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import type { Solicitud } from '@/src/api/types';
import { clientStatusText, INCIDENCIA_TIPOS, isActive, STEPS, stepIndex } from '@/src/lib/estado';
import { formatDate, formatDateTime, formatShortDate, formatTime12 } from '@/src/lib/format';
import { hapticSuccess } from '@/src/lib/media';
import { MapView } from '@/src/features/map/MapView';
import { QuoteCard } from '@/src/features/orders/QuoteCard';
import { ReprogramCard } from '@/src/features/orders/ReprogramCard';
import { SosButton } from '@/src/features/orders/SosButton';
import { TechFicha } from '@/src/features/orders/TechFicha';
import { EvidenceFeed, Gallery } from '@/src/features/orders/Gallery';
import { cancelOrder } from '@/src/features/orders/actions';
import { useSolicitud } from '@/src/features/orders/hooks';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

const CANCELABLE = ['PENDIENTE', 'ASIGNADA', 'EN_CAMINO', 'EN_SITIO', 'ESPERANDO_APROBACION'];
const SOS_STATES = ['EN_CAMINO', 'EN_SITIO', 'ESPERANDO_APROBACION', 'EN_PROCESO', 'POR_CONFIRMAR', 'SUSPENDIDA'];

// Seguimiento de la orden del cliente (RF-52-56, 66-70, 100-104, 112, 124-125) con el enfoque de CILIM:
// arriba el estado en palabras y una sola acción principal; los detalles y las demás opciones quedan
// en "Ver detalles del servicio" y "Más opciones". El botón SOS sigue siempre a la mano.
export default function Orden() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s, loading, error, refreshing, refresh, reload, setData } = useSolicitud(id);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<{ solicitud?: Solicitud; mensaje?: string }>) => {
    setBusy(key);
    try {
      const r = await fn();
      if (r.solicitud) setData(r.solicitud);
      else reload();
      if (r.mensaje) toast.success(r.mensaje);
      hapticSuccess();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (!s) {
    return (
      <Screen header={<AppBar title="Mi servicio" fallbackHref="/servicios" />}>
        {loading ? <Skeleton height={220} /> : null}
        {error ? <Banner tone="error" title="No pudimos abrir tu servicio" body={error} action={<Button title="Reintentar" variant="text" onPress={refresh} />} /> : null}
      </Screen>
    );
  }

  const status = clientStatusText(s);
  const t = s.tecnico;
  const active = isActive(s.estado);
  const showMap = ['ASIGNADA', 'EN_CAMINO'].includes(s.estado) && s.latitud && s.longitud;
  const home = s.latitud && s.longitud ? { lat: Number(s.latitud), lng: Number(s.longitud) } : null;
  const techPos = s.tecnico_ubicacion ? { lat: s.tecnico_ubicacion.latitud, lng: s.tecnico_ubicacion.longitud } : null;
  const go = (pathname: string, extra: Record<string, string> = {}) => router.push({ pathname: pathname as never, params: { id, ...extra } });

  const approveQuote = async (respuesta: 'ACEPTAR' | 'RECHAZAR') => {
    if (respuesta === 'RECHAZAR') {
      const ok = await dialog.confirm({
        title: '¿Rechazar el precio?',
        message: 'El técnico podrá mandarte otro o el servicio se cancelará sin cargo.',
        confirmText: 'Rechazar',
        destructive: true,
      });
      if (!ok) return;
    }
    run(respuesta, () => solicitudesApi.responderCotizacion(id, respuesta));
  };

  const resolve = async (accion: 'REASIGNAR' | 'CANCELAR' | 'CONTINUAR') => {
    if (!s.incidencia) return;
    if (accion === 'CANCELAR') {
      const ok = await dialog.confirm({ title: '¿Cancelar el servicio?', message: 'No se te cobrará nada.', confirmText: 'Cancelar servicio', destructive: true });
      if (!ok) return;
    }
    run(accion, () => solicitudesApi.resolverIncidencia(s.incidencia!.id_incidencia, accion));
  };

  const cancel = async () => {
    if (await cancelOrder(id, 'cliente')) reload();
  };

  return (
    <View style={styles.flex}>
      <Screen
        refreshing={refreshing}
        onRefresh={refresh}
        header={<AppBar title="Mi servicio" subtitle={`${s.categoria_nombre} · ${s.folio}`} fallbackHref="/servicios" />}
        contentStyle={{ paddingBottom: SOS_STATES.includes(s.estado) ? 96 : undefined }}
      >
        {/* ───── Estado en palabras ───── */}
        <View style={[styles.status, status.accion ? styles.statusAction : null]} accessibilityRole="summary">
          <Text variant="overline" tone="muted">{s.categoria_nombre} · {s.folio}</Text>
          <Text variant="display" style={styles.statusTitle}>{status.titulo}</Text>
          <Text variant="bodyLg" tone="soft">{status.detalle}</Text>
          {s.monto_total ? (
            <View style={styles.total}>
              <Text variant="bodyLg" tone="soft">Total</Text>
              <Money value={s.monto_total} size="lg" />
            </View>
          ) : null}
        </View>

        {s.alerta_sos ? <Banner tone="error" title="Alerta SOS activa" body="El equipo de seguridad ya fue notificado y te contactará." style={styles.gap} /> : null}
        {s.reprogramacion ? <View style={styles.gap}><ReprogramCard r={s.reprogramacion} onChanged={reload} /></View> : null}

        {/* ───── La acción principal según el estado ───── */}
        {s.estado === 'PENDIENTE' ? (
          <View style={styles.gap}>
            <Text variant="bodyLg" tone="soft">{s.tecnico_propuesto ? 'El técnico que elegiste tiene 10 minutos para responder.' : 'Si prefieres, puedes elegir tú al técnico.'}</Text>
            <Button title="Ver técnicos disponibles" icon="users" onPress={() => router.push({ pathname: '/elegir-tecnico/[id]', params: { id } })} full size="xl" style={styles.mt} />
          </View>
        ) : null}

        {showMap && home ? (
          <View style={[styles.gap, styles.map]}>
            <MapView
              center={techPos || home}
              zoom={14}
              fit={!!techPos}
              height={240}
              markers={[
                { id: 'casa', lat: home.lat, lng: home.lng, kind: 'cliente', label: 'Tu domicilio' },
                ...(techPos ? [{ id: 'tecnico', lat: techPos.lat, lng: techPos.lng, kind: 'tecnico' as const, label: t?.nombre || 'Técnico' }] : []),
              ]}
            />
            <View style={styles.mapInfo}>
              <Icon name="navigation" size={18} color={color.ink} />
              <Text variant="bodyLg" weight="600">
                {s.tecnico_ubicacion?.eta_min ? `Llega en unos ${s.tecnico_ubicacion.eta_min} minutos` : s.estado === 'EN_CAMINO' ? 'Ubicación en vivo' : 'Verás dónde va cuando salga hacia tu domicilio'}
              </Text>
            </View>
          </View>
        ) : null}

        {s.estado === 'ESPERANDO_APROBACION' ? (
          <View style={styles.gap}>
            <QuoteCard cotizacion={s.cotizacion} extras={s.extras} total={s.monto_total} title="Precio para aprobar" />
            <View style={styles.row}>
              <Button title="Rechazar" variant="outlined" onPress={() => approveQuote('RECHAZAR')} loading={busy === 'RECHAZAR'} disabled={!!busy} style={styles.flex} full size="xl" />
              <Button variant="accent" title="Aprobar" icon="check" onPress={() => approveQuote('ACEPTAR')} loading={busy === 'ACEPTAR'} disabled={!!busy} style={styles.flex} full size="xl" />
            </View>
          </View>
        ) : null}

        {s.estado === 'POR_CONFIRMAR' ? (
          <Button variant="accent" title="Confirmar y pagar" icon="check-circle" onPress={() => go('/orden/[id]/confirmar')} full size="xl" style={styles.gap} />
        ) : null}

        {s.estado === 'SUSPENDIDA' && s.incidencia ? (
          <Surface style={styles.gap}>
            <Text variant="title">Reporte {s.incidencia.folio}</Text>
            <Text variant="body" tone="soft">{INCIDENCIA_TIPOS.find((x) => x.value === s.incidencia?.tipo)?.label}: {s.incidencia.descripcion}</Text>
            {!s.incidencia.propia && s.incidencia.tipo === 'SEGURIDAD' ? (
              <Text variant="body" style={styles.mt}>El equipo de seguridad de Click & Serve está revisando este reporte y te contactará.</Text>
            ) : (
              <>
                <Text variant="subtitle" style={styles.mt}>¿Cómo quieres seguir?</Text>
                <View style={styles.stack}>
                  <Button title="Pedir otro técnico" icon="refresh-cw" onPress={() => resolve('REASIGNAR')} loading={busy === 'REASIGNAR'} disabled={!!busy} full size="xl" />
                  {s.incidencia.propia ? (
                    <Button title="Seguir con este técnico" variant="outlined" onPress={() => resolve('CONTINUAR')} loading={busy === 'CONTINUAR'} disabled={!!busy} full size="xl" />
                  ) : null}
                  <Button title="Cancelar sin cargo" variant="text" onPress={() => resolve('CANCELAR')} loading={busy === 'CANCELAR'} disabled={!!busy} full />
                </View>
              </>
            )}
          </Surface>
        ) : null}

        {s.estado === 'FINALIZADA' ? (
          <View style={styles.gap}>
            {s.garantia_hasta ? <Text variant="bodyLg" tone="soft">Tu garantía vale hasta el {formatDate(s.garantia_hasta)}.</Text> : null}
            {!s.calificacion_al_tecnico
              ? <Button title="Calificar al técnico" icon="star" onPress={() => go('/orden/[id]/calificar')} full size="xl" style={styles.mt} />
              : <Button title="Ver comprobante" icon="file-text" variant="outlined" onPress={() => go('/orden/[id]/comprobante')} full size="xl" style={styles.mt} />}
          </View>
        ) : null}

        {s.estado === 'CANCELADA' ? (
          <Banner tone="info" title={`Lo canceló ${s.cancelado_por === 'TECNICO' ? 'el técnico' : s.cancelado_por === 'SISTEMA' ? 'el sistema' : 'tú'}`} body={s.motivo_cancelacion || 'No se hizo ningún cargo.'} style={styles.gap} />
        ) : null}

        {/* ───── Técnico ───── */}
        {t ? (
          <>
            <SectionHeader title="Tu técnico" />
            <Surface>
              <TechFicha {...t} />
              {active ? (
                <View style={styles.row}>
                  <Button title="Mensaje" icon="message-circle" onPress={() => go('/chat/[id]')} style={styles.flex} full size="xl" />
                  {t.telefono ? <Button title="Llamar" variant="outlined" icon="phone" onPress={() => Linking.openURL(`tel:${t.telefono}`)} style={styles.flex} full size="xl" /> : null}
                </View>
              ) : null}
              <Button title="Ver su perfil" variant="text" onPress={() => router.push({ pathname: '/tecnico/[id]', params: { id: String(t.id_usuario) } })} style={styles.center} />
            </Surface>
          </>
        ) : null}

        {/* ───── Segundo nivel ───── */}
        <Collapsible title="Ver detalles del servicio" icon="file-text" style={styles.section}>
          {s.tareas?.length && ['EN_PROCESO', 'POR_CONFIRMAR'].includes(s.estado) ? (
            <Surface padded={false}>
              <Text variant="overline" tone="muted" style={styles.inset}>Avance del trabajo</Text>
              {s.tareas.map((tk) => (
                <ListItem key={tk.id_tarea} icon={tk.completada ? 'check-circle' : 'circle'} iconTone={tk.completada ? 'success' : 'neutral'} title={tk.descripcion} subtitle={tk.norma || undefined} />
              ))}
            </Surface>
          ) : null}
          {s.cotizacion && s.estado !== 'ESPERANDO_APROBACION' && s.estado !== 'CANCELADA' ? (
            <QuoteCard cotizacion={s.cotizacion} extras={s.extras} total={s.monto_total} title="Precio aprobado" />
          ) : null}
          {s.evidencias?.length ? (
            <View>
              <Text variant="overline" tone="muted" style={styles.label}>Fotos del trabajo</Text>
              <EvidenceFeed items={s.evidencias} />
            </View>
          ) : null}
          <Surface>
            <Text variant="overline" tone="muted" style={styles.label}>Avance</Text>
            <Steps steps={STEPS} current={stepIndex(s.estado, s.estado_previo)} stopped={s.estado === 'CANCELADA' || s.estado === 'SUSPENDIDA'} />
          </Surface>
          <Surface>
            <Text variant="overline" tone="muted" style={styles.label}>Lo que pediste</Text>
            <Text variant="bodyLg">{s.descripcion}</Text>
            <Divider />
            <Detail icon="map-pin" text={`${s.direccion || ''}${s.referencias ? ` · ${s.referencias}` : ''}`} />
            <Detail icon="calendar" text={s.fecha_preferida ? `${formatShortDate(s.fecha_preferida)}${s.hora_preferida ? ` · ${formatTime12(s.hora_preferida)}` : ''}` : 'Lo antes posible'} />
            <Detail icon="clock" text={`Lo pediste el ${formatDateTime(s.fecha_creacion)}`} />
            {s.imagenes?.length ? <View style={styles.mt}><Gallery items={s.imagenes.map((im, i) => ({ url: im.url, label: `Foto ${i + 1}` }))} size={80} /></View> : null}
          </Surface>
        </Collapsible>

        <Collapsible title="Más opciones" style={styles.sectionSmall}>
          <Surface padded={false}>
            {/* Con la calificación hecha, el comprobante ya es el botón principal. */}
            {s.estado === 'FINALIZADA' && !s.calificacion_al_tecnico ? (
              <ListItem icon="file-text" iconTone="brand" title="Ver comprobante" onPress={() => go('/orden/[id]/comprobante')} />
            ) : null}
            {['ASIGNADA', 'EN_CAMINO'].includes(s.estado) && !s.reprogramacion ? (
              <ListItem icon="calendar" iconTone="brand" title="Cambiar día u hora" onPress={() => router.push({ pathname: '/reprogramar/[id]', params: { id } })} />
            ) : null}
            {s.id_tecnico && s.estado !== 'CANCELADA' && !s.incidencia ? (
              <ListItem icon="alert-triangle" iconTone="warning" title={s.estado === 'FINALIZADA' ? 'Usar la garantía o reportar' : 'Reportar un problema'} onPress={() => go('/orden/[id]/incidencia')} />
            ) : null}
            <ListItem icon="life-buoy" iconTone="accent" title="Hablar con soporte" onPress={() => router.push({ pathname: '/soporte/nuevo', params: { solicitud: id } })} />
            {CANCELABLE.includes(s.estado) ? <ListItem icon="x-circle" title="Cancelar el servicio" destructive onPress={cancel} /> : null}
          </Surface>
        </Collapsible>
      </Screen>
      {SOS_STATES.includes(s.estado) ? <SosButton idSolicitud={s.id_solicitud} bottom={24} /> : null}
    </View>
  );
}

function Detail({ icon, text }: { icon: 'map-pin' | 'calendar' | 'clock'; text: string }) {
  return (
    <View style={styles.detail}>
      <Icon name={icon} size={18} color={color.inkMuted} />
      <Text variant="body" tone="soft" style={styles.flex}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  status: { borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.lineStrong, padding: space.lg, gap: space.xs },
  statusAction: { borderColor: color.accentStrong, borderWidth: 2 },
  statusTitle: { marginTop: space.xs },
  total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: color.line },
  gap: { marginTop: space.lg },
  mt: { marginTop: space.md },
  row: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  stack: { gap: space.sm, marginTop: space.sm },
  center: { alignSelf: 'center', marginTop: space.sm },
  map: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: color.line, backgroundColor: color.surface },
  mapInfo: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  section: { marginTop: space.xl },
  sectionSmall: { marginTop: space.md },
  inset: { paddingHorizontal: space.lg, paddingTop: space.md },
  label: { marginBottom: space.sm },
  detail: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginTop: space.sm },
});
