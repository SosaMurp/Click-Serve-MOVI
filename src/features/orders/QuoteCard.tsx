import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Money, space, Surface, Text } from '../../design';
import type { Concepto, Cotizacion } from '../../api/types';

const TIPO: Record<string, string> = { MANO_OBRA: 'Mano de obra', MATERIAL: 'Material', EXTRA: 'Adicional' };

// Cotización por conceptos (RF-72). Los totales los calcula el servidor; aquí solo se muestran.
export function QuoteCard({ cotizacion, extras = [], total, title = 'Cotización' }: { cotizacion: Cotizacion | null | undefined; extras?: Concepto[]; total?: string | null; title?: string }) {
  if (!cotizacion && !extras.length) return null;
  const items = [...(cotizacion?.conceptos || []), ...extras];
  return (
    <Surface>
      <Text variant="title" style={styles.title}>{title}</Text>
      {items.map((c) => (
        <View key={c.id_concepto} style={styles.item}>
          <View style={styles.flex}>
            <Text variant="body">{c.descripcion}</Text>
            <Text variant="caption" tone={c.tipo === 'EXTRA' ? 'warning' : 'muted'}>{TIPO[c.tipo]}</Text>
          </View>
          <Money value={c.monto} size="sm" />
        </View>
      ))}
      {cotizacion?.detalles ? <Text variant="bodySm" tone="muted" style={styles.notes}>{cotizacion.detalles}</Text> : null}
      {cotizacion?.tiempo_estimado_minutos ? <Text variant="bodySm" tone="muted">Tiempo estimado: {cotizacion.tiempo_estimado_minutos} min</Text> : null}
      <Divider />
      <View style={styles.totalRow}>
        <Text variant="subtitle">Total</Text>
        <Money value={total ?? cotizacion?.monto_total} size="lg" />
      </View>
      <Text variant="caption" tone="muted">IVA incluido. Calculado por Click & Serve con los conceptos aprobados.</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: space.sm },
  flex: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  notes: { marginTop: space.xs, marginBottom: space.xs },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md },
});
