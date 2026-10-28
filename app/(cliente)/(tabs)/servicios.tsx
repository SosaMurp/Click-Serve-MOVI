import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Button, EmptyState, Screen, SkeletonList, space, Surface, Tabs, Text } from '@/src/design';
import type { Solicitud } from '@/src/api/types';
import { clientStatusText } from '@/src/lib/estado';
import { formatShortDate } from '@/src/lib/format';
import { activeOrders, useMisSolicitudes } from '@/src/features/orders/hooks';

type Vista = 'curso' | 'terminados' | 'cancelados';

// RF-122/123: agenda de servicios pendientes e historial de terminados o cancelados (nada se oculta).
// Cada servicio dice su estado en palabras y, si le toca al cliente hacer algo, el botón lo dice.
export default function Servicios() {
  const router = useRouter();
  const { data, loading, refreshing, refresh, error } = useMisSolicitudes();
  const [vista, setVista] = useState<Vista>('curso');

  const lists = {
    curso: activeOrders(data),
    terminados: (data || []).filter((s) => s.estado === 'FINALIZADA'),
    cancelados: (data || []).filter((s) => s.estado === 'CANCELADA'),
  };
  const items = lists[vista];
  const open = (s: Solicitud) => router.push({ pathname: '/orden/[id]', params: { id: String(s.id_solicitud) } });

  return (
    <Screen inTabs refreshing={refreshing} onRefresh={refresh} header={<AppBar title="Mis servicios" back={false} />}>
      <Tabs<Vista>
        value={vista}
        onChange={setVista}
        options={[
          { value: 'curso', label: 'En curso', count: lists.curso.length },
          { value: 'terminados', label: 'Terminados' },
          { value: 'cancelados', label: 'Cancelados' },
        ]}
      />
      <View style={styles.list}>
        {loading ? <SkeletonList rows={3} /> : null}
        {error && !data ? <Text tone="danger">{error}</Text> : null}
        {!loading && data && !items.length ? (
          <EmptyState
            icon={vista === 'curso' ? 'clipboard' : vista === 'terminados' ? 'check-circle' : 'x-circle'}
            title={vista === 'curso' ? 'No tienes servicios en curso' : vista === 'terminados' ? 'Aún no terminas ningún servicio' : 'Sin servicios cancelados'}
            body={vista === 'curso' ? 'Cuando pidas un servicio, aquí verás cómo va.' : undefined}
            action={vista === 'curso' ? <Button variant="accent" title="Pedir un servicio" icon="plus" onPress={() => router.push('/nueva-solicitud')} size="xl" /> : undefined}
          />
        ) : null}
        {items.map((s) => <ServiceRow key={s.id_solicitud} s={s} onOpen={() => open(s)} />)}
      </View>
    </Screen>
  );
}

function ServiceRow({ s, onOpen }: { s: Solicitud; onOpen: () => void }) {
  const t = clientStatusText(s);
  return (
    <Surface onPress={t.accion ? undefined : onOpen} accessibilityLabel={`${s.categoria_nombre}: ${t.titulo}`} style={styles.row}>
      <Text variant="overline" tone="muted">{s.folio} · {formatShortDate(s.fecha_creacion)}</Text>
      <Text variant="title" style={styles.cat}>{s.categoria_nombre}</Text>
      <Text variant="bodyLg" weight="600">{t.titulo}</Text>
      <Text variant="body" tone="soft">{t.detalle}</Text>
      {t.accion ? <Button title={t.accion} variant="accent" onPress={onOpen} full size="xl" style={styles.action} /> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: space.lg },
  row: { marginBottom: space.md, gap: 2 },
  cat: { fontSize: 20, lineHeight: 26, marginBottom: space.xs },
  action: { marginTop: space.md },
});
