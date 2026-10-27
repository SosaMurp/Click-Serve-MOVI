import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Button, EmptyState, Screen, Segmented, SkeletonList, space, Text } from '@/src/design';
import { OrderCard } from '@/src/features/orders/OrderCard';
import { activeOrders, useMisSolicitudes } from '@/src/features/orders/hooks';

type Vista = 'curso' | 'terminados' | 'cancelados';

// RF-122/123: agenda de servicios pendientes e historial de terminados o cancelados (nada se oculta: lo cancelado queda marcado).
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

  return (
    <Screen inTabs refreshing={refreshing} onRefresh={refresh} header={<AppBar title="Mis servicios" back={false} />}>
      <Segmented<Vista>
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
            body={vista === 'curso' ? 'Cuando pidas un servicio, aquí verás su avance.' : undefined}
            action={vista === 'curso' ? <Button title="Nueva solicitud" icon="plus" onPress={() => router.push('/nueva-solicitud')} /> : undefined}
          />
        ) : null}
        {items.map((s) => (
          <OrderCard key={s.id_solicitud} s={s} rol="cliente" onPress={() => router.push({ pathname: '/orden/[id]', params: { id: String(s.id_solicitud) } })} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: space.lg },
});
