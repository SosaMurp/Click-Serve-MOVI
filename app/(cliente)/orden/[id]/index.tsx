import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppBar, Banner, Button, color, Divider, Icon, ListItem, Money, radius, Screen, SectionHeader, Skeleton, space, Steps, Surface, Text,
} from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import type { Solicitud } from '@/src/api/types';
import { estadoInfo, INCIDENCIA_TIPOS, isActive, STEPS, stepIndex } from '@/src/lib/estado';
import { formatDate, formatDateTime, formatShortDate, formatTime12 } from '@/src/lib/format';
import { hapticSuccess } from '@/src/lib/media';
import { MapView } from '@/src/features/map/MapView';
import { OrderHero } from '@/src/features/orders/OrderHero';
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

// Seguimiento de la orden del cliente (RF-52-56, 66-70, 100-104, 112, 124-125).
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
      <Screen header={<AppBar title="Orden" fallbackHref="/servicios" />}>
        {loading ? <Skeleton height={220} /> : null}
        {error ? <Banner tone="error" title="No pudimos abrir la orden" body={error} action={<Button title="Reintentar" variant="text" onPress={refresh} />} /> : null}
      </Screen>
    );
  }

  const info = estadoInfo(s.estado, 'cliente');
  const t = s.tecnico;
  const active = isActive(s.estado);
  const showMap = ['ASIGNADA', 'EN_CAMINO'].includes(s.estado) && s.latitud && s.longitud;
  const home = s.latitud && s.longitud ? { lat: Number(s.latitud), lng: Number(s.longitud) } : null;
  const techPos = s.tecnico_ubicacion ? { lat: s.tecnico_ubicacion.latitud, lng: s.tecnico_ubicacion.longitud } : null;

  const approveQuote = async (respuesta: 'ACEPTAR' | 'RECHAZAR') => {
    if (respuesta === 'RECHAZAR') {
      const ok = await dialog.confirm({
        title: '¿Rechazar la cotización?',
        message: 'El técnico podrá enviarte una nueva o el servicio se cancelará sin cargo.',
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
      const ok = await dialog.confirm({ title: '¿Cancelar la orden?', message: 'No se te cobrará nada.', confirmText: 'Cancelar orden', destructive: true });
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
        header={(
          <AppBar
            title={s.categoria_nombre}
            subtitle={s.folio}
            fallbackHref="/servicios"
            actions={t && active ? [{ icon: 'message-circle', label: 'Chat con el técnico', onPress: () => router.push({ pathname: '/chat/[id]', params: { id } }) }] : []}
          />
        )}
        contentStyle={{ paddingBottom: SOS_STATES.includes(s.estado) ? 96 : undefined }}
      >
        <OrderHero s={s} />
        <Text variant="body" tone="soft" style={styles.hint}>{info.hint}</Text>

        {s.alerta_sos ? <Banner tone="error" title="Alerta SOS activa" body="El equipo de seguridad ya fue notificado y te contactará." style={styles.gap} /> : null}
        {s.reprogramacion ? <View style={styles.gap}><ReprogramCard r={s.reprogramacion} onChanged={reload} /></View> : null}

        {/* ───── Acción según el estado ───── */}
        {s.estado === 'PENDIENTE' ? (
          <Surface tint="sky" style={styles.gap}>
            <Text variant="title">{s.tecnico_propuesto ? 'Esperando que el técnico acepte' : 'Buscando técnico cercano'}</Text>
            <Text variant="bodySm" tone="soft">{s.tecnico_propuesto ? 'Tiene 10 minutos para responder.' : 'Te avisamos en cuanto alguien acepte. También puedes elegirlo tú.'}</Text>
            <Button title="Ver técnicos disponibles" icon="users" variant="filled" onPress={() => router.push({ pathname: '/elegir-tecnico/[id]', params: { id } })} style={styles.mt} />
          </Surface>
        ) : null}

        {showMap && home ? (
          <View style={[styles.gap, styles.map]}>
            <MapView
              center={techPos || home}
              zoom={14}
              fit={!!techPos}
              height={220}
              markers={[
                { id: 'casa', lat: home.lat, lng: home.lng, kind: 'cliente', label: 'Tu domicilio' },
                ...(techPos ? [{ id: 'tecnico', lat: techPos.lat, lng: techPos.lng, kind: 'tecnico' as const, label: t?.nombre || 'Técnico' }] : []),
              ]}
            />
            <View style={styles.mapInfo}>
              <Icon name="navigation" size={16} color={color.brandInk} />
              <Text variant="label" tone="brand">
                {s.tecnico_ubicacion?.eta_min ? `Llega en ~${s.tecnico_ubicacion.eta_min} min` : s.estado === 'EN_CAMINO' ? 'Ubicación en vivo' : 'Verás su ubicación cuando salga hacia tu domicilio'}
              </Text>
            </View>
          </View>
        ) : null}

        {s.estado === 'ESPERANDO_APROBACION' ? (
          <View style={styles.gap}>
            <QuoteCard cotizacion={s.cotizacion} extras={s.extras} total={s.monto_total} title="Cotización para aprobar" />
            <View style={styles.row}>
              <Button title="Rechazar" variant="outlined" onPress={() => approveQuote('RECHAZAR')} loading={busy === 'RECHAZAR'} disabled={!!busy} style={styles.flex} />
              <Button title="Aprobar" icon="check" onPress={() => approveQuote('ACEPTAR')} loading={busy === 'ACEPTAR'} disabled={!!busy} style={styles.flex} />
            </View>
          </View>
        ) : null}

        {s.estado === 'POR_CONFIRMAR' ? (
          <Surface tint="peach" style={styles.gap}>
            <Text variant="title">El técnico terminó</Text>
            <Text variant="bodySm" tone="soft">Revisa la evidencia y confirma que el trabajo quedó bien para liberar el pago.</Text>
            <Button title="Revisar y pagar" icon="check-circle" onPress={() => router.push({ pathname: '/orden/[id]/confirmar', params: { id } })} style={styles.mt} />
          </Surface>
        ) : null}

        {s.estado === 'SUSPENDIDA' && s.incidencia ? (
          <Surface style={styles.gap}>
            <Text variant="title">Reporte {s.incidencia.folio}</Text>
            <Text variant="bodySm" tone="soft">{INCIDENCIA_TIPOS.find((x) => x.value === s.incidencia?.tipo)?.label}: {s.incidencia.descripcion}</Text>
            {!s.incidencia.propia && s.incidencia.tipo === 'SEGURIDAD' ? (
              <Text variant="bodySm" style={styles.mt}>El equipo de seguridad de Click & Serve está revisando este reporte y te contactará.</Text>
            ) : (
              <>
                <Text variant="label" style={styles.mt}>¿Cómo quieres seguir?</Text>
                <View style={styles.stack}>
                  <Button title="Pedir otro técnico" icon="refresh-cw" variant="filled" onPress={() => resolve('REASIGNAR')} loading={busy === 'REASIGNAR'} disabled={!!busy} full />
                  {s.incidencia.propia ? (
                    <Button title="Continuar con este técnico" variant="outlined" onPress={() => resolve('CONTINUAR')} loading={busy === 'CONTINUAR'} disabled={!!busy} full />
                  ) : null}
                  <Button title="Cancelar sin cargo" variant="text" onPress={() => resolve('CANCELAR')} loading={busy === 'CANCELAR'} disabled={!!busy} full />
                </View>
              </>
            )}
          </Surface>
        ) : null}

        {s.estado === 'FINALIZADA' ? (
          <Surface tint="sky" style={styles.gap}>
            <View style={styles.paidRow}>
              <View style={styles.flex}>
                <Text variant="caption" tone="muted">Pagaste</Text>
                <Money value={s.pago?.monto || s.monto_total} size="lg" />
              </View>
              <View style={styles.paidIcon}><Icon name="check" size={22} color={color.inkOnColor} /></View>
            </View>
            {s.garantia_hasta ? <Text variant="bodySm" tone="soft">Garantía vigente hasta el {formatDate(s.garantia_hasta)}.</Text> : null}
            <View style={styles.rowWrap}>
              <Button title="Comprobante" icon="file-text" variant="white" onPress={() => router.push({ pathname: '/orden/[id]/comprobante', params: { id } })} />
              {!s.calificacion_al_tecnico ? <Button title="Calificar" icon="star" onPress={() => router.push({ pathname: '/orden/[id]/calificar', params: { id } })} /> : null}
            </View>
          </Surface>
        ) : null}

        {s.estado === 'CANCELADA' ? (
          <Banner tone="info" title={`Cancelada por ${s.cancelado_por === 'TECNICO' ? 'el técnico' : s.cancelado_por === 'SISTEMA' ? 'el sistema' : 'ti'}`} body={s.motivo_cancelacion || 'Sin cargo.'} style={styles.gap} />
        ) : null}

        {/* ───── Técnico ───── */}
        {t ? (
          <>
            <SectionHeader title="Tu técnico" />
            <Surface>
              <TechFicha {...t} />
              <View style={styles.row}>
                <Button title="Perfil" variant="outlined" icon="user" onPress={() => router.push({ pathname: '/tecnico/[id]', params: { id: String(t.id_usuario) } })} style={styles.flex} />
                {active ? <Button title="Mensaje" variant="tonal" icon="message-circle" onPress={() => router.push({ pathname: '/chat/[id]', params: { id } })} style={styles.flex} /> : null}
                {active && t.telefono ? <Button title="Llamar" variant="tonal" icon="phone" onPress={() => Linking.openURL(`tel:${t.telefono}`)} style={styles.flex} /> : null}
              </View>
            </Surface>
          </>
        ) : null}

        {/* ───── Trabajo en proceso: tareas y adicionales ───── */}
        {s.tareas?.length && ['EN_PROCESO', 'POR_CONFIRMAR'].includes(s.estado) ? (
          <>
            <SectionHeader title="Avance del trabajo" />
            <Surface padded={false}>
              {s.tareas.map((tk) => (
                <ListItem key={tk.id_tarea} icon={tk.completada ? 'check-circle' : 'circle'} iconTone={tk.completada ? 'success' : 'neutral'} title={tk.descripcion} subtitle={tk.norma || undefined} />
              ))}
            </Surface>
          </>
        ) : null}

        {s.cotizacion && s.estado !== 'ESPERANDO_APROBACION' && s.estado !== 'CANCELADA' ? (
          <>
            <SectionHeader title="Cotización aprobada" />
            <QuoteCard cotizacion={s.cotizacion} extras={s.extras} total={s.monto_total} title="Conceptos" />
          </>
        ) : null}

        {s.evidencias?.length ? (
          <>
            <SectionHeader title="Evidencia del trabajo" />
            <EvidenceFeed items={s.evidencias} />
          </>
        ) : null}

        {/* ───── Avance y detalle ───── */}
        <SectionHeader title="Avance" />
        <Surface>
          <Steps steps={STEPS} current={stepIndex(s.estado, s.estado_previo)} stopped={s.estado === 'CANCELADA' || s.estado === 'SUSPENDIDA'} />
        </Surface>

        <SectionHeader title="Detalle de la solicitud" />
        <Surface>
          <Text variant="body">{s.descripcion}</Text>
          <Divider />
          <Detail icon="map-pin" text={`${s.direccion || ''}${s.referencias ? ` · ${s.referencias}` : ''}`} />
          <Detail icon="calendar" text={s.fecha_preferida ? `${formatShortDate(s.fecha_preferida)}${s.hora_preferida ? ` · ${formatTime12(s.hora_preferida)}` : ''}` : 'Lo antes posible'} />
          <Detail icon="clock" text={`Creada el ${formatDateTime(s.fecha_creacion)}`} />
          {s.imagenes?.length ? <View style={styles.mt}><Gallery items={s.imagenes.map((im, i) => ({ url: im.url, label: `Foto ${i + 1}` }))} size={72} /></View> : null}
        </Surface>

        {/* ───── Otras acciones ───── */}
        <SectionHeader title="¿Necesitas algo más?" />
        <Surface padded={false}>
          {['ASIGNADA', 'EN_CAMINO'].includes(s.estado) && !s.reprogramacion ? (
            <ListItem icon="calendar" iconTone="brand" title="Cambiar fecha u hora" onPress={() => router.push({ pathname: '/reprogramar/[id]', params: { id } })} />
          ) : null}
          {s.id_tecnico && s.estado !== 'CANCELADA' && !s.incidencia ? (
            <ListItem icon="alert-triangle" iconTone="warning" title={s.estado === 'FINALIZADA' ? 'Reclamar garantía o reportar' : 'Reportar un problema'} onPress={() => router.push({ pathname: '/orden/[id]/incidencia', params: { id } })} />
          ) : null}
          <ListItem icon="life-buoy" iconTone="accent" title="Hablar con soporte" onPress={() => router.push({ pathname: '/soporte/nuevo', params: { solicitud: id } })} />
          {CANCELABLE.includes(s.estado) ? <ListItem icon="x-circle" title="Cancelar solicitud" destructive onPress={cancel} /> : null}
        </Surface>
      </Screen>
      {SOS_STATES.includes(s.estado) ? <SosButton idSolicitud={s.id_solicitud} bottom={24} /> : null}
    </View>
  );
}

function Detail({ icon, text }: { icon: 'map-pin' | 'calendar' | 'clock'; text: string }) {
  return (
    <View style={styles.detail}>
      <Icon name={icon} size={16} color={color.inkMuted} />
      <Text variant="bodySm" tone="soft" style={styles.flex}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hint: { marginTop: space.md },
  gap: { marginTop: space.lg },
  mt: { marginTop: space.md },
  row: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  stack: { gap: space.sm, marginTop: space.sm },
  map: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surface },
  mapInfo: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  paidRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  paidIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.success, alignItems: 'center', justifyContent: 'center' },
  detail: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginTop: space.sm },
});
