import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, EmptyState, Screen, SectionHeader, SkeletonList, space, Tabs, Text } from '@/src/design';
import { errorMessage, fileUrl } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import type { Solicitud } from '@/src/api/types';
import { hapticSuccess } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { useAvailability } from '@/src/state/availability';
import { OrderCard } from '@/src/features/orders/OrderCard';
import { PanelHeader } from '@/src/features/tech/PanelHeader';
import { RequestCard } from '@/src/features/tech/RequestCard';
import { NextStopCard, ScheduledRow } from '@/src/features/tech/NextStopCard';
import { useResumenTecnico, useTrabajos, Vista } from '@/src/features/tech/hooks';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-21/58/111/122/123: Panel de Trabajo del técnico (referencia). Abre en NUEVAS con contadores por pestaña.
export default function Trabajos() {
  const router = useRouter();
  const { user } = useSession();
  const { disponible } = useAvailability();
  const resumen = useResumenTecnico();
  const [vista, setVista] = useState<Vista>('nuevas');
  const lista = useTrabajos(vista);
  const [busy, setBusy] = useState<string | null>(null);
  const items = lista.data?.solicitudes || [];
  const c = lista.data?.contadores || resumen.data?.contadores;

  const openRequest = (s: Solicitud) => router.push({ pathname: '/solicitud/[id]', params: { id: String(s.id_solicitud) } });
  const openJob = (s: Solicitud) => router.push({ pathname: '/trabajo/[id]', params: { id: String(s.id_solicitud) } });
  // Navegación al domicilio en la app de mapas; sin coordenadas, el detalle del trabajo.
  const openMap = (s: Solicitud) => {
    if (s.latitud != null && s.longitud != null) Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${s.latitud},${s.longitud}`);
    else openJob(s);
  };

  async function accept(s: Solicitud) {
    setBusy(`a${s.id_solicitud}`);
    try {
      await solicitudesApi.aceptar(s.id_solicitud);
      hapticSuccess();
      toast.success(`Aceptaste ${s.folio}. Avisa cuando vayas en camino.`);
      openJob(s);
    } catch (e) {
      toast.error(errorMessage(e));
      lista.reload();
    } finally {
      setBusy(null);
    }
  }

  async function discard(s: Solicitud) {
    const ok = await dialog.confirm({ title: '¿Rechazar esta solicitud?', message: 'Ya no te aparecerá en la lista.', confirmText: 'Rechazar' });
    if (!ok) return;
    setBusy(`d${s.id_solicitud}`);
    try {
      await solicitudesApi.descartar(s.id_solicitud);
      lista.reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const [siguiente, ...programados] = vista === 'en_curso' ? items : [];

  return (
    <Screen
      inTabs
      refreshing={lista.refreshing}
      onRefresh={() => { lista.refresh(); resumen.reload(); }}
      header={<PanelHeader nombre={user?.nombre} apellido={user?.apellido} fotoUrl={fileUrl(user?.foto_url)} onAvatar={() => router.push('/perfil')} resumen={resumen.data} />}
    >
      {user && !user.aprobado ? (
        <Banner tone="warning" title="Tu cuenta está en revisión" body="Podrás aceptar trabajos cuando aprobemos tus documentos." action={<Button title="Ver verificación" variant="text" onPress={() => router.push('/verificacion')} />} style={styles.gap} />
      ) : null}

      <Tabs<Vista>
        value={vista}
        onChange={setVista}
        options={[
          { value: 'nuevas', label: 'Nuevas', count: c?.nuevas },
          { value: 'en_curso', label: 'En curso', count: c?.en_curso },
          { value: 'historial', label: 'Historial' },
        ]}
      />

      {lista.loading ? <View style={styles.top}><SkeletonList rows={2} /></View> : null}
      {lista.error && !lista.data ? <Banner tone="error" title="No pudimos cargar tus trabajos" body={lista.error} style={styles.top} /> : null}
      {!lista.loading && lista.data && !items.length ? (
        vista === 'nuevas' ? (
          <EmptyState
            icon={disponible ? 'radio' : 'moon'}
            title={disponible ? 'Sin solicitudes por ahora' : 'Estás desconectado'}
            body={disponible ? 'Te avisaremos en cuanto un cliente cercano pida un servicio de tus especialidades.' : 'Toca OFFLINE, arriba a la derecha, para empezar a recibir trabajos.'}
          />
        ) : <EmptyState icon={vista === 'en_curso' ? 'tool' : 'archive'} title={vista === 'en_curso' ? 'Sin trabajos en curso' : 'Aún no tienes historial'} />
      ) : null}

      {vista === 'nuevas' && items.length ? (
        <>
          <SectionHeader title="Solicitud recibida" />
          {items.map((s) => (
            <RequestCard
              key={s.id_solicitud}
              s={s}
              onOpen={() => openRequest(s)}
              onAccept={() => accept(s)}
              onReject={() => discard(s)}
              busy={busy === `a${s.id_solicitud}` ? 'a' : busy === `d${s.id_solicitud}` ? 'd' : null}
              canAccept={!!user?.aprobado && !busy}
            />
          ))}
          <Text variant="caption" tone="muted" align="center" style={styles.note}>
            Recuerda que al aceptar se habilitará el chat directo con el cliente y tu ubicación será compartida.
          </Text>
        </>
      ) : null}

      {vista === 'en_curso' && siguiente ? (
        <View style={styles.top}>
          <NextStopCard
            s={siguiente}
            onOpen={() => openJob(siguiente)}
            onChat={() => router.push({ pathname: '/chat/[id]', params: { id: String(siguiente.id_solicitud) } })}
            onMap={() => openMap(siguiente)}
          />
          {programados.length ? (
            <>
              <SectionHeader title="Programado" />
              {programados.map((s) => <ScheduledRow key={s.id_solicitud} s={s} onPress={() => openJob(s)} />)}
            </>
          ) : null}
        </View>
      ) : null}

      {vista === 'historial' ? (
        <View style={styles.top}>
          {items.map((s) => <OrderCard key={s.id_solicitud} s={s} rol="tecnico" onPress={() => openJob(s)} />)}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: space.md },
  top: { marginTop: space.lg },
  note: { marginTop: space.xs, marginBottom: space.lg, paddingHorizontal: space.lg },
});
