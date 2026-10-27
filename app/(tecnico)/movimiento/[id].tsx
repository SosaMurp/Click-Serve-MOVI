import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppBar, Banner, Button, color, Divider, Folio, HeroCard, Icon, Pill, Screen, Skeleton, space, Surface, Text } from '@/src/design';
import { billeteraApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { formatDateTime, formatMoney } from '@/src/lib/format';
import { receiptHtml, shareReceipt } from '@/src/lib/receipt';
import { toast } from '@/src/ui/toast';

// RF-79/94: comprobante de un ingreso (con desglose) o de un retiro (con folio de transferencia).
export default function Movimiento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: c, loading, error } = useLoader(() => billeteraApi.comprobante(id).then((r) => r.comprobante), [id]);
  const [sharing, setSharing] = useState(false);

  if (!c) {
    return (
      <Screen header={<AppBar title="Comprobante" fallbackHref="/movimientos" />}>
        {loading ? <Skeleton height={300} /> : null}
        {error ? <Banner tone="error" title="No pudimos cargar el comprobante" body={error} /> : null}
      </Screen>
    );
  }

  const ingreso = c.tipo === 'INGRESO';
  const rows = [
    { label: 'Tipo', value: ingreso ? 'Pago de servicio' : 'Retiro a cuenta bancaria' },
    { label: 'Fecha', value: formatDateTime(c.fecha) },
    { label: 'Estado', value: c.estado === 'COMPLETADO' ? 'Completado' : c.estado === 'PENDIENTE' ? 'En proceso' : c.estado },
    { label: 'Beneficiario', value: c.beneficiario },
    ...(c.folio_solicitud ? [{ label: 'Servicio', value: `${c.categoria_nombre || ''} ${c.folio_solicitud}`.trim() }] : []),
    ...(!ingreso && c.cuenta_destino ? [{ label: 'Cuenta destino', value: `${c.banco_destino || ''} ${c.cuenta_destino}`.trim() }] : []),
    ...(c.desglose ? [
      { label: 'Total pagado por el cliente', value: formatMoney(c.desglose.total) },
      { label: 'Comisión Click & Serve', value: `−${formatMoney(c.desglose.comision)}` },
      { label: 'Retención ISR', value: `−${formatMoney(c.desglose.retencion_isr)}` },
      { label: 'Retención IVA', value: `−${formatMoney(c.desglose.retencion_iva)}` },
    ] : []),
    { label: ingreso ? 'Neto a tu billetera' : 'Monto retirado', value: formatMoney(c.monto), strong: true },
  ];

  async function share() {
    setSharing(true);
    try {
      await shareReceipt(receiptHtml(ingreso ? 'Comprobante de ingreso' : 'Comprobante de transferencia', c!.folio, rows));
    } catch {
      toast.error('No se pudo generar el comprobante.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <Screen header={<AppBar title="Comprobante" fallbackHref="/movimientos" />} footer={<Button title="Compartir o imprimir" icon="share-2" onPress={share} loading={sharing} full size="lg" />}>
      <HeroCard>
        <View style={styles.icon}><Icon name={ingreso ? 'arrow-down-left' : 'arrow-up-right'} size={24} color={ingreso ? color.success : color.accentPressed} /></View>
        <Text variant="label" tone="onColor" style={styles.dim}>{ingreso ? 'Ingreso' : 'Retiro'}</Text>
        <Text variant="display" tone="onColor" tabular>{ingreso ? '+' : '−'}{formatMoney(c.monto)}</Text>
        <Pill label={rows[2].value} tone={c.estado === 'COMPLETADO' ? 'success' : 'warning'} size="sm" solid style={styles.pill} />
      </HeroCard>
      <Surface style={styles.gap}>
        <Folio value={c.folio} label={ingreso ? 'Folio' : 'Folio de transferencia'} />
        <Divider />
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text variant={r.strong ? 'subtitle' : 'bodySm'} tone={r.strong ? 'default' : 'soft'} style={styles.flex}>{r.label}</Text>
            <Text variant={r.strong ? 'title' : 'body'} tabular style={styles.value}>{r.value}</Text>
          </View>
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginTop: space.md },
  dim: { opacity: 0.9 },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  pill: { marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  value: { maxWidth: '55%', textAlign: 'right' },
});
