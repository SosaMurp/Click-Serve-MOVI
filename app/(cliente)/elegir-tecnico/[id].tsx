import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar, Banner, Button, color, elevation, EmptyState, radius, Screen, Skeleton, space, Surface, Text } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import type { TecnicoRecomendado } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { hapticSuccess, LZC_CENTER } from '@/src/lib/media';
import { MapView } from '@/src/features/map/MapView';
import { TechFicha } from '@/src/features/orders/TechFicha';
import { cancelOrder } from '@/src/features/orders/actions';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

// RF-19/20/48-51: técnicos disponibles cerca, en un mapa claro con un carrusel de fichas comparables.
export default function ElegirTecnico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const orden = useSolicitud(id);
  const tecnicos = useLoader(() => solicitudesApi.recomendados(id).then((r) => r.tecnicos), [id]);
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const carousel = useRef<ScrollView>(null);
  const s = orden.data;
  const list = tecnicos.data || [];
  const cardW = Math.min(width, 640) - space.lg * 2 - 24;
  const { reload } = tecnicos;

  // Al aceptar el técnico (o cancelarse), esta pantalla ya no aplica: se pasa al seguimiento.
  useEffect(() => {
    if (s && s.estado !== 'PENDIENTE') router.replace({ pathname: '/orden/[id]', params: { id: String(s.id_solicitud) } });
  }, [s, router]);

  // Refresca la disponibilidad cada 30 s: un técnico puede desconectarse mientras se compara.
  useEffect(() => {
    const t = setInterval(reload, 30000);
    return () => clearInterval(t);
  }, [reload]);

  const propuesto = s?.tecnico_propuesto ? list.find((t) => t.id_usuario === s.tecnico_propuesto) : null;
  const center = s?.latitud && s?.longitud ? { lat: Number(s.latitud), lng: Number(s.longitud) } : { lat: LZC_CENTER.latitude, lng: LZC_CENTER.longitude };

  const focus = (t: TecnicoRecomendado, i: number, scroll = true) => {
    setSelected(t.id_usuario);
    if (scroll) carousel.current?.scrollTo({ x: i * (cardW + space.md), animated: true });
  };

  async function choose(t: TecnicoRecomendado) {
    setBusy(`t${t.id_usuario}`);
    try {
      const r = await solicitudesApi.proponer(id, t.id_usuario);
      hapticSuccess();
      toast.success(r.mensaje);
      orden.setData(r.solicitud);
    } catch (e) {
      toast.error(errorMessage(e));
      reload();
    } finally {
      setBusy(null);
    }
  }

  async function automatic() {
    setBusy('auto');
    try {
      const r = await solicitudesApi.automatica(id);
      toast.success(r.mensaje);
      router.replace({ pathname: '/orden/[id]', params: { id: String(id) } });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    if (await cancelOrder(id, 'cliente')) router.replace('/servicios');
  }

  return (
    <Screen
      header={(
        <AppBar
          title="Elige a tu técnico"
          subtitle={s ? `${s.categoria_nombre} · ${s.folio}` : undefined}
          fallbackHref="/servicios"
          actions={[{ icon: 'refresh-cw', label: 'Actualizar técnicos', onPress: tecnicos.refresh }]}
        />
      )}
      refreshing={tecnicos.refreshing}
      onRefresh={tecnicos.refresh}
    >
      <View style={styles.map}>
        <MapView
          center={center}
          zoom={13}
          fit={list.some((t) => t.latitud_aprox != null)}
          height={260}
          markers={[
            { id: 'cliente', lat: center.lat, lng: center.lng, kind: 'cliente', label: 'Tu domicilio' },
            ...list.filter((t) => t.latitud_aprox != null && t.longitud_aprox != null).map((t) => ({
              id: String(t.id_usuario),
              lat: Number(t.latitud_aprox),
              lng: Number(t.longitud_aprox),
              kind: (selected === t.id_usuario || s?.tecnico_propuesto === t.id_usuario ? 'propuesta' : 'tecnico') as 'propuesta' | 'tecnico',
              label: t.nombre,
            })),
          ]}
          onMarkerPress={(mid) => {
            const i = list.findIndex((t) => String(t.id_usuario) === mid);
            if (i >= 0) focus(list[i], i);
          }}
        />
      </View>

      {s?.tecnico_propuesto ? (
        <Banner
          tone="info"
          title={`Esperando respuesta de ${propuesto?.nombre || 'tu técnico'}`}
          body="Tiene 10 minutos para aceptar. Si no responde, puedes elegir a otro o usar la búsqueda automática."
          style={styles.gap}
        />
      ) : null}

      <View style={styles.headRow}>
        <Text variant="title" style={styles.flex}>{tecnicos.loading ? 'Buscando técnicos…' : `${list.length} disponible${list.length === 1 ? '' : 's'} cerca`}</Text>
        <Text variant="caption" tone="muted">Ubicación aproximada</Text>
      </View>

      {tecnicos.loading ? <Skeleton height={180} /> : null}
      {tecnicos.error && !tecnicos.data ? <Banner tone="error" title="No pudimos cargar los técnicos" body={tecnicos.error} /> : null}

      {!tecnicos.loading && tecnicos.data && !list.length ? (
        <EmptyState
          icon="users"
          title="No hay técnicos conectados ahora"
          body="Con la búsqueda automática avisamos a los técnicos de la especialidad en cuanto se conecten."
        />
      ) : null}

      {list.length ? (
        <ScrollView
          ref={carousel}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardW + space.md}
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + space.md));
            if (list[i]) focus(list[i], i, false);
          }}
        >
          {list.map((t, i) => {
            const isProp = s?.tecnico_propuesto === t.id_usuario;
            const on = selected === t.id_usuario;
            return (
              <Surface key={t.id_usuario} style={{ ...styles.card, width: cardW, ...(on ? styles.cardOn : null) }}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Ver en el mapa a ${t.nombre} ${t.apellido}`} onPress={() => focus(t, i)}>
                  {i === 0 ? <Text variant="overline" tone="accent" style={styles.best}>Mejor opción</Text> : null}
                  <TechFicha {...t} />
                  {t.bio ? <Text variant="bodySm" tone="soft" numberOfLines={2} style={styles.bio}>{t.bio}</Text> : null}
                </Pressable>
                <View style={styles.actions}>
                  <Button title="Ver perfil" variant="outlined" onPress={() => router.push({ pathname: '/tecnico/[id]', params: { id: String(t.id_usuario), solicitud: String(id) } })} style={styles.flex} />
                  <Button
                    variant="accent"
                    title={isProp ? 'Enviada' : 'Elegir'}
                    icon={isProp ? 'clock' : 'check'}
                    onPress={() => choose(t)}
                    loading={busy === `t${t.id_usuario}`}
                    disabled={!!busy || isProp}
                    style={styles.flex}
                  />
                </View>
              </Surface>
            );
          })}
        </ScrollView>
      ) : null}

      <Surface tint="sky" style={styles.auto}>
        <Text variant="title">¿Sin preferencia?</Text>
        <Text variant="bodySm" tone="soft">Asignamos al técnico disponible más cercano con la especialidad.</Text>
        <Button title="Búsqueda automática" icon="zap" variant="filled" onPress={automatic} loading={busy === 'auto'} disabled={!!busy} style={styles.autoBtn} />
      </Surface>

      <Button title="Cancelar solicitud" variant="text" icon="x" onPress={cancel} style={styles.cancel} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginTop: space.md },
  map: { borderRadius: radius.lg, overflow: 'hidden', ...elevation[1] },
  headRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.lg, marginBottom: space.md },
  carousel: { gap: space.md, paddingRight: space.lg },
  card: { borderWidth: 2, borderColor: 'transparent' },
  cardOn: { borderColor: color.accent },
  best: { marginBottom: space.sm },
  bio: { marginTop: space.sm },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  auto: { marginTop: space.lg, gap: 4 },
  autoBtn: { marginTop: space.md },
  cancel: { alignSelf: 'center', marginTop: space.md },
});
