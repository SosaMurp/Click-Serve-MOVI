import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Button, color, EmptyState, Icon, IconButton, Pill, radius, Screen, SkeletonList, space, Surface, Text } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { direccionesApi } from '@/src/api/endpoints';
import type { Direccion } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-123: domicilios guardados; uno es el predeterminado para nuevas solicitudes.
export default function Direcciones() {
  const router = useRouter();
  const { data, loading, setData, reload, refreshing, refresh } = useLoader(() => direccionesApi.lista().then((r) => r.direcciones), []);

  async function makeDefault(d: Direccion) {
    try {
      const r = await direccionesApi.principal(d.id_direccion);
      setData(r.direcciones);
      toast.success(`${d.etiqueta} es tu dirección principal.`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(d: Direccion) {
    const ok = await dialog.confirm({ title: `¿Eliminar "${d.etiqueta}"?`, message: 'Tus servicios anteriores no cambian.', confirmText: 'Eliminar', destructive: true });
    if (!ok) return;
    try {
      await direccionesApi.eliminar(d.id_direccion);
      toast.show('Dirección eliminada.');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const list = data || [];
  return (
    <Screen
      header={<AppBar title="Mis direcciones" />}
      refreshing={refreshing}
      onRefresh={refresh}
      footer={<Button title="Agregar dirección" icon="plus" onPress={() => router.push('/direccion')} full size="lg" />}
    >
      {loading ? <SkeletonList rows={2} /> : null}
      {!loading && !list.length ? <EmptyState icon="map-pin" title="Sin direcciones guardadas" body="Guarda tu casa o trabajo para pedir servicios más rápido." /> : null}
      {list.map((d) => (
        <Surface key={d.id_direccion} style={styles.card}>
          <View style={styles.top}>
            <View style={[styles.icon, d.predeterminada && { backgroundColor: color.accentSoft }]}>
              <Icon name={d.etiqueta.toLowerCase().includes('trabajo') ? 'briefcase' : 'home'} size={20} color={d.predeterminada ? color.accentInk : color.brandInk} />
            </View>
            <View style={styles.flex}>
              <View style={styles.titleRow}>
                <Text variant="title">{d.etiqueta}</Text>
                {d.predeterminada ? <Pill label="Principal" tone="accent" size="sm" /> : null}
              </View>
              <Text variant="bodySm" tone="soft">{d.calle} {d.numero}{d.interior ? ` int. ${d.interior}` : ''}, {d.colonia}{d.cp ? `, C.P. ${d.cp}` : ''}</Text>
              <Text variant="caption" tone="muted">{d.ciudad}{d.latitud ? ' · punto en el mapa' : ''}</Text>
            </View>
            <IconButton icon="edit-2" label={`Editar ${d.etiqueta}`} onPress={() => router.push({ pathname: '/direccion', params: { id: String(d.id_direccion) } })} />
          </View>
          <View style={styles.actions}>
            {!d.predeterminada ? <Button title="Hacer principal" variant="tonal" onPress={() => makeDefault(d)} /> : null}
            <Button title="Eliminar" variant="text" icon="trash-2" onPress={() => remove(d)} />
          </View>
        </Surface>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  card: { marginBottom: space.md },
  top: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  icon: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm, marginTop: space.md },
});
