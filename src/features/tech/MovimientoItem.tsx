import React from 'react';
import { color, ListItem, Text } from '../../design';
import type { Movimiento } from '../../api/types';
import { formatMoney, formatRelative } from '../../lib/format';

// Fila de movimiento de la billetera: ingreso en verde con +, retiro con −; el signo nunca depende solo del color.
export function MovimientoItem({ m, onPress }: { m: Movimiento; onPress: () => void }) {
  const ingreso = m.tipo === 'INGRESO';
  return (
    <ListItem
      icon={ingreso ? 'arrow-down-left' : 'arrow-up-right'}
      iconTone={ingreso ? 'success' : 'accent'}
      title={ingreso ? (m.categoria_nombre ? `Servicio · ${m.categoria_nombre}` : 'Pago de servicio') : 'Retiro a tu cuenta'}
      subtitle={`${m.folio} · ${formatRelative(m.fecha)}${m.estado !== 'COMPLETADO' ? ` · ${m.estado === 'PENDIENTE' ? 'En proceso' : m.estado}` : ''}`}
      trailing={<Text variant="subtitle" tabular style={{ color: ingreso ? color.successInk : color.ink }}>{ingreso ? '+' : '−'}{formatMoney(m.monto)}</Text>}
      onPress={onPress}
      chevron={false}
    />
  );
}
