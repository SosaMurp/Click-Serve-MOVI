import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppBar, Banner, Button, color, EmptyState, Icon, radius, Screen, SkeletonList, space, Text } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { pagosApi } from '@/src/api/endpoints';
import type { Tarjeta } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-90/91: tarjetas tokenizadas. Click & Serve solo guarda el token, la marca y los últimos 4 dígitos.
export default function Tarjetas() {
  const router = useRouter();
  const { data, loading, setData, reload } = useLoader(() => pagosApi.tarjetas().then((r) => r.metodos), []);

  async function makeDefault(t: Tarjeta) {
    try {
      const r = await pagosApi.principal(t.id_metodo);
      setData(r.metodos);
      toast.success(`Tarjeta •••• ${t.ultimos_4} es tu principal.`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(t: Tarjeta) {
    const ok = await dialog.confirm({ title: `¿Eliminar la tarjeta •••• ${t.ultimos_4}?`, confirmText: 'Eliminar', destructive: true });
    if (!ok) return;
    try {
      await pagosApi.eliminar(t.id_metodo);
      toast.show('Tarjeta eliminada.');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const list = data || [];
  return (
    <Screen header={<AppBar title="Métodos de pago" />} footer={<Button title="Agregar tarjeta" icon="plus" onPress={() => router.push('/tarjeta-nueva')} full size="lg" />}>
      <Banner tone="info" title="Pagos protegidos" body="Tu número de tarjeta se cifra en el teléfono y lo procesa Conekta; nosotros nunca lo vemos ni guardamos el CVV." />
      {loading ? <SkeletonList rows={2} /> : null}
      {!loading && !list.length ? <EmptyState icon="credit-card" title="Sin tarjetas" body="Agrega una tarjeta para pagar tus servicios al terminar." /> : null}
      {list.map((t) => (
        <View key={t.id_metodo} style={styles.item}>
          <LinearGradient colors={t.predeterminada ? [color.navy, color.navy] : [color.inkSoft, color.inkSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <View style={styles.cardTop}>
              <Text variant="title" tone="onColor">{t.marca}</Text>
              {t.predeterminada ? <View style={styles.badge}><Text variant="caption" style={{ color: color.ink }}>Principal</Text></View> : null}
            </View>
            <Text variant="number" tone="onColor" tabular style={styles.number}>•••• •••• •••• {t.ultimos_4}</Text>
            <View style={styles.cardTop}>
              <Text variant="label" tone="onColor" numberOfLines={1} style={styles.flex}>{t.titular}</Text>
              <Text variant="label" tone="onColor" tabular>{t.expiracion}</Text>
            </View>
          </LinearGradient>
          <View style={styles.actions}>
            {!t.predeterminada ? <Button title="Hacer principal" variant="tonal" onPress={() => makeDefault(t)} /> : null}
            <Button title="Eliminar" variant="text" icon="trash-2" onPress={() => remove(t)} />
          </View>
        </View>
      ))}
      <View style={styles.secure}>
        <Icon name="lock" size={14} color={color.inkMuted} />
        <Text variant="caption" tone="muted">Cifrado de extremo a extremo · PCI DSS</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { marginTop: space.lg },
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.lg, minHeight: 170, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  number: { letterSpacing: 1 },
  badge: { backgroundColor: color.accent, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm, marginTop: space.sm },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: space.xl },
});
