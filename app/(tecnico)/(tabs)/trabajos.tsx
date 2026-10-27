import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, EmptyState, HomeHeader, Pill, Screen, Segmented, SkeletonList, space, Text } from '@/src/design';
import { errorMessage, fileUrl } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import type { Solicitud } from '@/src/api/types';
import { hapticSuccess } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { useAvailability } from '@/src/state/availability';
import { OrderCard } from '@/src/features/orders/OrderCard';
import { OnlineCard } from '@/src/features/tech/OnlineCard';
import { useResumenTecnico, useTrabajos, Vista } from '@/src/features/tech/hooks';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-21/58/111/122/123: panel del técnico. Abre en NUEVAS con contadores por pestaña.
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

  const open = (s: Solicitud) => router.push(vista === 'nuevas'
    ? { pathname: '/solicitud/[id]', params: { id: String(s.id_solicitud) } }
    : { pathname: '/trabajo/[id]', params: { id: String(s.id_solicitud) } });

  async function accept(s: Solicitud) {
    setBusy(`a${s.id_solicitud}`);
    try {
      await solicitudesApi.aceptar(s.id_solicitud);
      hapticSuccess();
      toast.success(`Aceptaste ${s.folio}. Avisa cuando vayas en camino.`);
      router.push({ pathname: '/trabajo/[id]', params: { id: String(s.id_solicitud) } });
    } catch (e) {
      toast.error(errorMessage(e));
      lista.reload();
    } finally {
      setBusy(null);
    }
  }

  async function discard(s: Solicitud) {
    const ok = await dialog.confirm({ title: '¿Descartar esta solicitud?', message: 'Ya no te aparecerá en la lista.', confirmText: 'Descartar' });
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

  return (
    <Screen
      inTabs
      refreshing={lista.refreshing}
      onRefresh={() => { lista.refresh(); resumen.reload(); }}
      header={(
        <HomeHeader
          nombre={user?.nombre}
          apellido={user?.apellido}
          fotoUrl={fileUrl(user?.foto_url)}
          onAvatar={() => router.push('/perfil')}
          actions={[
            { icon: 'map', label: 'Mapa de solicitudes', onPress: () => router.push('/mapa') },
            { icon: 'bell', label: 'Solicitudes nuevas', onPress: () => setVista('nuevas'), badge: (c?.nuevas || 0) > 0 },
          ]}
        />
      )}
    >
      {user && !user.aprobado ? (
        <Banner tone="warning" title="Tu cuenta está en revisión" body="Podrás aceptar trabajos cuando aprobemos tus documentos." action={<Button title="Ver verificación" variant="text" onPress={() => router.push('/verificacion')} />} style={styles.gap} />
      ) : null}

      <OnlineCard resumen={resumen.data} />

      <View style={styles.tabs}>
        <Segmented<Vista>
          value={vista}
          onChange={setVista}
          options={[
            { value: 'nuevas', label: 'Nuevas', count: c?.nuevas },
            { value: 'en_curso', label: 'En curso', count: c?.en_curso },
            { value: 'historial', label: 'Historial' },
          ]}
        />
      </View>

      {lista.loading ? <SkeletonList rows={3} /> : null}
      {lista.error && !lista.data ? <Banner tone="error" title="No pudimos cargar tus trabajos" body={lista.error} /> : null}
      {!lista.loading && lista.data && !items.length ? (
        vista === 'nuevas' ? (
          <EmptyState
            icon={disponible ? 'radio' : 'moon'}
            title={disponible ? 'Sin solicitudes por ahora' : 'Estás desconectado'}
            body={disponible ? 'Te avisaremos en cuanto un cliente cercano pida un servicio de tus especialidades.' : 'Activa el interruptor de arriba para empezar a recibir trabajos.'}
          />
        ) : <EmptyState icon={vista === 'en_curso' ? 'tool' : 'archive'} title={vista === 'en_curso' ? 'Sin trabajos en curso' : 'Aún no tienes historial'} />
      ) : null}

      {items.map((s) => (
        <OrderCard
          key={s.id_solicitud}
          s={s}
          rol="tecnico"
          onPress={() => open(s)}
          footer={vista === 'nuevas' ? (
            <View>
              {s.propuesta_a_mi ? <Pill label="Te eligieron a ti" tone="accent" icon="star" size="sm" style={styles.prop} /> : null}
              {s.zona ? <Text variant="caption" tone="muted" style={styles.zona}>Zona aproximada: {s.zona}</Text> : null}
              <View style={styles.actions}>
                <Button title="Descartar" variant="outlined" onPress={() => discard(s)} loading={busy === `d${s.id_solicitud}`} disabled={!!busy} style={styles.flex} />
                <Button title="Aceptar" icon="check" onPress={() => accept(s)} loading={busy === `a${s.id_solicitud}`} disabled={!!busy || !user?.aprobado} style={styles.flex} />
              </View>
            </View>
          ) : undefined}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginBottom: space.md },
  tabs: { marginTop: space.lg, marginBottom: space.lg },
  prop: { marginTop: space.md },
  zona: { marginTop: space.sm },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
});
