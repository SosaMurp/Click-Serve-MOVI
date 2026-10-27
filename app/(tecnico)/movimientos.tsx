import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, EmptyState, Screen, Segmented, SkeletonList, space, Surface } from '@/src/design';
import { billeteraApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { MovimientoItem } from '@/src/features/tech/MovimientoItem';

type Filtro = 'todos' | 'INGRESO' | 'RETIRO';

// RF-75/79: historial de ingresos y retiros con acceso a cada comprobante.
export default function Movimientos() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const { data, loading, refreshing, refresh } = useLoader(() => billeteraApi.movimientos(filtro === 'todos' ? undefined : filtro).then((r) => r.movimientos), [filtro]);
  const list = data || [];
  return (
    <Screen header={<AppBar title="Movimientos" fallbackHref="/billetera" />} refreshing={refreshing} onRefresh={refresh}>
      <Segmented<Filtro> value={filtro} onChange={setFiltro} options={[{ value: 'todos', label: 'Todos' }, { value: 'INGRESO', label: 'Ingresos' }, { value: 'RETIRO', label: 'Retiros' }]} />
      <View style={styles.list}>
        {loading ? <SkeletonList rows={4} /> : null}
        {!loading && !list.length ? <EmptyState icon="list" title="Sin movimientos" /> : null}
        {list.length ? (
          <Surface padded={false}>
            {list.map((m) => <MovimientoItem key={m.id_transaccion} m={m} onPress={() => router.push({ pathname: '/movimiento/[id]', params: { id: String(m.id_transaccion) } })} />)}
          </Surface>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: space.lg },
});
