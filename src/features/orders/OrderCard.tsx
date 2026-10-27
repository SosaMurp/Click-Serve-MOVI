import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { color, Icon, Money, space, Surface, Text } from '../../design';
import type { Solicitud } from '../../api/types';
import { formatDistance, formatShortDate, formatTime12 } from '../../lib/format';
import { StatusPlate } from './StatusPlate';

// Fila de orden: la placa de estado vive siempre arriba a la derecha (celda fija) y va junto a su prueba.
export function OrderCard({ s, rol, onPress, footer }: { s: Solicitud; rol: 'cliente' | 'tecnico'; onPress?: () => void; footer?: React.ReactNode }) {
  const who = rol === 'cliente'
    ? (s.tecnico ? `${s.tecnico.nombre} ${s.tecnico.apellido}` : null)
    : `${s.cliente_nombre || 'Cliente'} ${s.cliente_apellido || ''}`.trim();
  const when = s.fecha_preferida ? `${formatShortDate(s.fecha_preferida)}${s.hora_preferida ? ` · ${formatTime12(s.hora_preferida)}` : ''}` : 'Fecha abierta';
  return (
    <Surface onPress={footer ? undefined : onPress} accessibilityLabel={`${s.categoria_nombre}, folio ${s.folio}`} style={styles.card}>
      <Pressable disabled={!footer || !onPress} onPress={onPress} accessibilityRole={footer && onPress ? 'button' : undefined} accessibilityLabel={footer ? `Ver ${s.categoria_nombre}, folio ${s.folio}` : undefined}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text variant="caption" tone="muted" tabular>{s.folio}</Text>
          <Text variant="title" numberOfLines={1}>{s.categoria_nombre}</Text>
        </View>
        <StatusPlate estado={s.estado} rol={rol} />
      </View>
      <Text variant="bodySm" tone="soft" numberOfLines={2} style={styles.desc}>{s.descripcion}</Text>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={16} color={color.inkMuted} />
          <Text variant="caption" tone="muted">{when}</Text>
        </View>
        {who ? (
          <View style={styles.metaItem}>
            <Icon name={rol === 'cliente' ? 'tool' : 'user'} size={16} color={color.inkMuted} />
            <Text variant="caption" tone="muted" numberOfLines={1}>{who}</Text>
          </View>
        ) : null}
        {s.distancia_km != null ? (
          <View style={styles.metaItem}>
            <Icon name="navigation" size={16} color={color.inkMuted} />
            <Text variant="caption" tone="muted">{formatDistance(s.distancia_km)}</Text>
          </View>
        ) : null}
        {s.monto_total ? <View style={styles.amount}><Money value={s.monto_total} size="sm" /></View> : null}
      </View>
      </Pressable>
      {footer}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space.md },
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  desc: { marginTop: space.xs },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md, marginTop: space.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '60%' },
  amount: { marginLeft: 'auto' },
});
