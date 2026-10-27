import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Button, color, elevation, Icon, radius, Screen, space, Surface, Text } from '@/src/design';
import type { Solicitud } from '@/src/api/types';
import { formatDistance, formatShortDate } from '@/src/lib/format';
import { LZC_CENTER, quietLocation } from '@/src/lib/media';
import { useAvailability } from '@/src/state/availability';
import { MapView } from '@/src/features/map/MapView';
import { useTrabajos } from '@/src/features/tech/hooks';

// RF-105/106: mapa claro con las solicitudes cercanas (posición aproximada) y carrusel de tarjetas.
export default function Mapa() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { disponible, cambiando, setDisponible } = useAvailability();
  const lista = useTrabajos('nuevas');
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [focusTo, setFocusTo] = useState<{ lat: number; lng: number } | null>(null);
  const carousel = useRef<ScrollView>(null);
  const items = (lista.data?.solicitudes || []).filter((s) => s.latitud_aprox != null && s.longitud_aprox != null);
  const cardW = Math.min(width, 640) - space.lg * 2 - 40;

  useEffect(() => {
    quietLocation().then((p) => p && setMe({ lat: p.latitude, lng: p.longitude }));
  }, []);

  const focus = (s: Solicitud, i: number, scroll = true) => {
    setSelected(s.id_solicitud);
    setFocusTo({ lat: Number(s.latitud_aprox), lng: Number(s.longitud_aprox) });
    if (scroll) carousel.current?.scrollTo({ x: i * (cardW + space.md), animated: true });
  };

  return (
    <Screen inTabs scroll={false} padded={false} header={<AppBar title="Solicitudes cerca" back={false} actions={[{ icon: 'refresh-cw', label: 'Actualizar', onPress: lista.refresh }]} />}>
      <View style={styles.flex}>
        <MapView
          center={me || { lat: LZC_CENTER.latitude, lng: LZC_CENTER.longitude }}
          zoom={13}
          style={styles.map}
          fit={items.length > 0}
          recenterTo={me}
          focusTo={focusTo}
          controlsBottom={items.length || !disponible ? 230 : 120}
          markers={[
            ...(me ? [{ id: 'yo', lat: me.lat, lng: me.lng, kind: 'yo' as const }] : []),
            ...items.map((s) => ({
              id: String(s.id_solicitud),
              lat: Number(s.latitud_aprox),
              lng: Number(s.longitud_aprox),
              kind: (selected === s.id_solicitud || s.propuesta_a_mi ? 'propuesta' : 'solicitud') as 'propuesta' | 'solicitud',
              label: s.categoria_nombre,
            })),
          ]}
          onMarkerPress={(mid) => {
            const i = items.findIndex((s) => String(s.id_solicitud) === mid);
            if (i >= 0) focus(items[i], i);
          }}
        />

        <View style={styles.overlay} pointerEvents="box-none">
          {!disponible ? (
            <Surface style={styles.offline}>
              <Icon name="moon" size={20} color={color.brandInk} />
              <Text variant="subtitle" style={styles.flex}>Estás desconectado</Text>
              <Button title="Conectarme" onPress={() => setDisponible(true)} loading={cambiando} />
            </Surface>
          ) : null}

          {items.length ? (
            <ScrollView
              ref={carousel}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardW + space.md}
              decelerationRate="fast"
              contentContainerStyle={styles.carousel}
              onMomentumScrollEnd={(e) => {
                const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + space.md));
                if (items[i]) focus(items[i], i, false);
              }}
            >
              {items.map((s, i) => (
                <Pressable
                  key={s.id_solicitud}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.categoria_nombre}, ${formatDistance(s.distancia_km)}`}
                  onPress={() => (selected === s.id_solicitud ? router.push({ pathname: '/solicitud/[id]', params: { id: String(s.id_solicitud) } }) : focus(s, i))}
                  style={[styles.card, { width: cardW }, selected === s.id_solicitud && styles.cardOn]}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.catIcon}><Icon name="tool" size={18} color={color.inkOnColor} /></View>
                    <View style={styles.flex}>
                      <Text variant="subtitle" numberOfLines={1}>{s.categoria_nombre}</Text>
                      <Text variant="caption" tone="muted" numberOfLines={1}>{s.zona || 'Zona aproximada'} · {formatDistance(s.distancia_km)}</Text>
                    </View>
                  </View>
                  <Text variant="bodySm" tone="soft" numberOfLines={2}>{s.descripcion}</Text>
                  <View style={styles.cardFoot}>
                    <Text variant="caption" tone="muted">{s.fecha_preferida ? formatShortDate(s.fecha_preferida) : 'Lo antes posible'}</Text>
                    <View style={styles.see}><Text variant="label" tone="brand">Ver</Text><Icon name="arrow-right" size={16} color={color.brandInk} /></View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Surface style={styles.empty}>
              <Text variant="subtitle">{lista.loading ? 'Buscando solicitudes…' : 'No hay solicitudes cerca'}</Text>
              <Text variant="caption" tone="muted">Las ubicaciones son aproximadas hasta que aceptas el trabajo.</Text>
            </Surface>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%', borderRadius: 0 },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: space.lg, gap: space.md },
  offline: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginHorizontal: space.lg },
  carousel: { gap: space.md, paddingHorizontal: space.lg },
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderWidth: 2, borderColor: 'transparent', ...elevation[2] },
  cardOn: { borderColor: color.accent },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  catIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  see: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty: { marginHorizontal: space.lg, gap: 4 },
});
