import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Banner, Button, color, EmptyState, HeroCard, Icon, ListItem, MetricBox, Screen, SectionHeader, Skeleton, space, Surface, Text } from '@/src/design';
import { billeteraApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { formatMoney } from '@/src/lib/format';
import { useRealtime } from '@/src/state/realtime';
import { useResumenTecnico } from '@/src/features/tech/hooks';
import { MovimientoItem } from '@/src/features/tech/MovimientoItem';

// RF-71-79: saldo, retiro, cuenta bancaria y movimientos recientes.
export default function Billetera() {
  const router = useRouter();
  const wallet = useLoader(() => billeteraApi.ver(), []);
  const movs = useLoader(() => billeteraApi.movimientos().then((r) => r.movimientos), []);
  const resumen = useResumenTecnico();
  useRealtime('billetera.actualizada', () => { wallet.reload(); movs.reload(); });
  const w = wallet.data;
  const saldo = Number(w?.saldo_actual || 0);
  const minimo = Number(w?.minimo_retiro || 0);

  return (
    <Screen
      inTabs
      refreshing={wallet.refreshing}
      onRefresh={() => { wallet.refresh(); movs.reload(); resumen.reload(); }}
      header={<AppBar title="Billetera" back={false} actions={[{ icon: 'help-circle', label: 'Ayuda sobre retiros', onPress: () => router.push({ pathname: '/ayuda/[slug]', params: { slug: 'retiros' } }) }]} />}
    >
      {wallet.loading ? <Skeleton height={200} /> : null}
      {w ? (
        <HeroCard>
          <Text variant="label" tone="onColor" style={styles.dim}>Saldo disponible</Text>
          <Text variant="display" tone="onColor" tabular>{formatMoney(w.saldo_actual)}</Text>
          <Text variant="caption" tone="onColor" style={styles.dim}>Retiro mínimo {formatMoney(w.minimo_retiro)}</Text>
          <View style={styles.heroActions}>
            <Button
              title="Retirar"
              icon="arrow-up-right"
              variant="white"
              onPress={() => router.push(w.tiene_clabe ? '/retiro' : '/cuenta-bancaria')}
              disabled={w.tiene_clabe && saldo < minimo}
              style={styles.flex}
            />
            <Button title="Movimientos" icon="list" variant="tonal" onPress={() => router.push('/movimientos')} style={styles.flex} />
          </View>
        </HeroCard>
      ) : null}

      {w && !w.tiene_clabe ? (
        <Banner tone="warning" title="Registra tu cuenta bancaria" body="Necesitas una CLABE a tu nombre para retirar tu saldo." action={<Button title="Agregar CLABE" variant="text" onPress={() => router.push('/cuenta-bancaria')} />} style={styles.gap} />
      ) : null}

      <Surface tint="sky" style={styles.gap}>
        <Text variant="title">Esta semana</Text>
        <View style={styles.metrics}>
          <MetricBox value={resumen.data ? formatMoney(resumen.data.ganancias_semana) : '—'} label="Ganado" tone="brand" />
          <MetricBox value={resumen.data?.servicios_semana ?? '—'} label="Servicios" />
          <MetricBox value={resumen.data?.servicios_total ?? '—'} label="Total" />
        </View>
      </Surface>

      {w?.tiene_clabe ? (
        <>
          <SectionHeader title="Cuenta de depósito" />
          <Surface padded={false}>
            <ListItem icon="briefcase" iconTone="brand" title={w.banco || 'Cuenta CLABE'} subtitle={`CLABE ${w.clabe}`} onPress={() => router.push('/cuenta-bancaria')} />
          </Surface>
        </>
      ) : null}

      <SectionHeader title="Movimientos recientes" onAction={() => router.push('/movimientos')} />
      {movs.loading ? <Skeleton height={120} /> : null}
      {!movs.loading && !(movs.data || []).length ? <EmptyState icon="credit-card" title="Sin movimientos" body="Cuando un cliente confirme un servicio, el pago aparecerá aquí con su desglose." /> : null}
      {(movs.data || []).length ? (
        <Surface padded={false}>
          {(movs.data || []).slice(0, 5).map((m) => <MovimientoItem key={m.id_transaccion} m={m} onPress={() => router.push({ pathname: '/movimiento/[id]', params: { id: String(m.id_transaccion) } })} />)}
        </Surface>
      ) : null}

      <View style={styles.note}>
        <Icon name="info" size={14} color={color.inkMuted} />
        <Text variant="caption" tone="muted" style={styles.flex}>Cada pago llega ya con la comisión de Click & Serve y las retenciones de ISR e IVA aplicadas; consulta el desglose en cada movimiento.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dim: { opacity: 0.9 },
  gap: { marginTop: space.lg },
  heroActions: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  metrics: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  note: { flexDirection: 'row', gap: space.sm, marginTop: space.lg, alignItems: 'flex-start' },
});
