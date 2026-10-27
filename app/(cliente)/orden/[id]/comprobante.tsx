import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar, Banner, Button, color, Divider, Folio, HeroCard, Icon, Screen, Skeleton, space, Surface, Text } from '@/src/design';
import { formatDate, formatDateTime, formatMoney } from '@/src/lib/format';
import { receiptHtml, shareReceipt } from '@/src/lib/receipt';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

// RF-94: comprobante del servicio pagado, para guardar, imprimir o compartir.
export default function Comprobante() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s, loading } = useSolicitud(id);
  const [sharing, setSharing] = useState(false);

  if (!s) return <Screen header={<AppBar title="Comprobante" />}>{loading ? <Skeleton height={320} /> : null}</Screen>;
  if (!s.pago) {
    return (
      <Screen header={<AppBar title="Comprobante" />}>
        <Banner tone="info" title="Aún no hay pago registrado" body="El comprobante aparece cuando confirmas y pagas el servicio." />
      </Screen>
    );
  }

  const tecnico = s.tecnico ? `${s.tecnico.nombre} ${s.tecnico.apellido}` : '—';
  const rows = [
    { label: 'Servicio', value: s.categoria_nombre },
    { label: 'Técnico', value: tecnico },
    { label: 'Fecha de pago', value: formatDateTime(s.pago.fecha) },
    { label: 'Referencia de pago', value: s.pago.referencia },
    ...(s.cotizacion?.conceptos || []).concat(s.extras || []).map((c) => ({ label: c.descripcion, value: formatMoney(c.monto) })),
    { label: 'Total pagado (IVA incluido)', value: formatMoney(s.pago.monto), strong: true },
  ];

  async function share() {
    setSharing(true);
    try {
      await shareReceipt(receiptHtml('Comprobante de servicio', s!.folio, rows, s!.garantia_hasta ? `Garantía de 90 días, vigente hasta el ${formatDate(s!.garantia_hasta)}.` : undefined));
    } catch {
      toast.error('No se pudo generar el comprobante.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Comprobante" fallbackHref="/servicios" />}
      footer={<Button title="Compartir o imprimir" icon="share-2" onPress={share} loading={sharing} full size="lg" />}
    >
      <HeroCard>
        <View style={styles.okIcon}><Icon name="check" size={26} color={color.success} /></View>
        <Text variant="label" tone="onColor" style={styles.dim}>Pago realizado</Text>
        <Text variant="display" tone="onColor" tabular>{formatMoney(s.pago.monto)}</Text>
        <Text variant="bodySm" tone="onColor" style={styles.dim}>{s.categoria_nombre} · {formatDateTime(s.pago.fecha)}</Text>
      </HeroCard>

      <Surface style={styles.gap}>
        <Folio value={s.folio} />
        <Divider />
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text variant={r.strong ? 'subtitle' : 'bodySm'} tone={r.strong ? 'default' : 'soft'} style={styles.flex}>{r.label}</Text>
            <Text variant={r.strong ? 'title' : 'body'} tabular style={styles.value}>{r.value}</Text>
          </View>
        ))}
        {s.pago.modo === 'SIMULADO' ? <Text variant="caption" tone="muted" style={styles.gap}>Pago de prueba (entorno de desarrollo).</Text> : null}
      </Surface>

      {s.garantia_hasta ? (
        <Banner tone="success" title="Garantía de 90 días" body={`Vigente hasta el ${formatDate(s.garantia_hasta)}. Si algo falla, repórtalo desde la orden.`} style={styles.gap} />
      ) : null}
      {!s.calificacion_al_tecnico ? (
        <Button title="Calificar al técnico" icon="star" variant="tonal" onPress={() => router.push({ pathname: '/orden/[id]/calificar', params: { id } })} style={styles.center} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginTop: space.md },
  center: { alignSelf: 'center', marginTop: space.lg },
  dim: { opacity: 0.9 },
  okIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  value: { maxWidth: '58%', textAlign: 'right' },
});
