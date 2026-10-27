import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, HeroCard, Icon, IconName, radius, space, Text } from '../../design';
import type { Solicitud } from '../../api/types';
import { formatMoney } from '../../lib/format';
import { estadoInfo, stepIndex } from '../../lib/estado';

const MINI: { label: string; icon: IconName; bar: string; at: number }[] = [
  { label: 'Asignado', icon: 'user-check', bar: color.brandMid, at: 1 },
  { label: 'En camino', icon: 'navigation', bar: '#9EC5EA', at: 2 },
  { label: 'Cotización', icon: 'file-text', bar: color.accentSoft, at: 3 },
  { label: 'Pago', icon: 'check-circle', bar: '#F3B98A', at: 5 },
];

// Tarjeta destacada de una orden en curso: degradado de marca, dos cifras grandes y avance en mini-indicadores.
export function OrderHero({ s, rol = 'cliente' }: { s: Solicitud; rol?: 'cliente' | 'tecnico' }) {
  const info = estadoInfo(s.estado, rol);
  const step = stepIndex(s.estado, s.estado_previo);
  const eta = s.tecnico_ubicacion?.eta_min;
  return (
    <HeroCard>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text variant="label" tone="onColor" style={styles.dim}>{s.categoria_nombre} · {s.folio}</Text>
          <Text variant="title" tone="onColor" numberOfLines={2}>{info.label}</Text>
        </View>
        <View style={styles.statusIcon}><Icon name={info.icon as IconName} size={18} color={color.inkOnColor} /></View>
      </View>
      <View style={styles.figures}>
        <View>
          <Text variant="caption" tone="onColor" style={styles.dim}>{eta ? 'Llega en' : rol === 'cliente' ? 'Técnico' : 'Cliente'}</Text>
          <Text variant="number" tone="onColor" numberOfLines={1}>
            {eta ? `${eta} min` : rol === 'cliente' ? (s.tecnico?.nombre || 'Buscando…') : (s.cliente_nombre || '—')}
          </Text>
        </View>
        <View>
          <Text variant="caption" tone="onColor" style={styles.dim}>Total</Text>
          <Text variant="number" tone="onColor" tabular>{s.monto_total || s.monto_cotizacion ? formatMoney(s.monto_total || s.monto_cotizacion) : '—'}</Text>
        </View>
      </View>
      <View style={styles.row} accessibilityRole="progressbar" accessibilityLabel={`Avance: ${info.label}`}>
        {MINI.map((m) => {
          const done = step >= m.at;
          return (
            <View key={m.label} style={styles.mini}>
              <View style={styles.miniTop}>
                <View style={[styles.miniIcon, { backgroundColor: done ? m.bar : color.surfaceSunk }]}>
                  <Icon name={m.icon} size={15} color={done ? color.ink : color.inkMuted} />
                </View>
                <Text variant="caption" tone={done ? 'default' : 'muted'} numberOfLines={1} style={styles.miniLabel}>{m.label}</Text>
              </View>
              <View style={[styles.bar, { backgroundColor: done ? m.bar : color.line }]} />
            </View>
          );
        })}
      </View>
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  dim: { opacity: 0.85 },
  statusIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  figures: { flexDirection: 'row', gap: space.xxl, marginTop: space.md },
  row: { flexDirection: 'row', gap: space.sm, backgroundColor: color.surface, borderRadius: radius.md, padding: space.md, marginTop: space.lg },
  mini: { flex: 1, gap: 6 },
  miniTop: { alignItems: 'center', gap: 4 },
  miniIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  miniLabel: { fontSize: 11, lineHeight: 14, textAlign: 'center' },
  bar: { height: 4, borderRadius: 2 },
});
