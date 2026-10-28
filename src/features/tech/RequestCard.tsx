import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, color, Icon, IconName, radius, space, Surface, Text } from '../../design';
import type { Solicitud } from '../../api/types';
import { formatDistance, formatShortDate, formatTime12 } from '../../lib/format';

type Props = {
  s: Solicitud;
  onAccept: () => void;
  onReject: () => void;
  onOpen: () => void;
  busy?: 'a' | 'd' | null;
  canAccept: boolean;
};

// Tarjeta de "SOLICITUD RECIBIDA" (referencia): franja marino con el tipo de asignación y el folio,
// cliente, categoría, zona, descripción, fecha y hora, y RECHAZAR / ACEPTAR TRABAJO (RF-58).
export function RequestCard({ s, onAccept, onReject, onOpen, busy, canAccept }: Props) {
  const cliente = `${s.cliente_nombre || 'Cliente'} ${s.cliente_apellido || ''}`.trim();
  const lugar = [s.zona, s.distancia_km != null ? `a ${formatDistance(s.distancia_km)}` : null].filter(Boolean).join(' · ');
  return (
    <Surface padded={false} style={styles.card}>
      <View style={styles.strip}>
        <Text variant="overline" tone="onColor">{s.propuesta_a_mi ? 'Asignación directa' : 'Solicitud cercana'}</Text>
        <Text variant="overline" tone="onColor" tabular>#{s.folio}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver la solicitud de ${cliente}, ${s.categoria_nombre}`} onPress={onOpen} style={styles.body}>
        <Text variant="overline" tone="muted">Cliente</Text>
        <View style={styles.who}>
          <Text variant="headline" style={styles.flex} numberOfLines={2}>{cliente}</Text>
          <View style={styles.chip}><Text variant="overline" tone="soft" numberOfLines={1}>{s.categoria_nombre}</Text></View>
        </View>
        {lugar ? <Text variant="bodySm" tone="muted">{lugar}</Text> : null}

        <View style={styles.desc}>
          <Text variant="overline" tone="muted">Descripción de la falla</Text>
          <Text variant="body" style={styles.italic} numberOfLines={4}>{s.descripcion}</Text>
        </View>

        <View style={styles.boxes}>
          <InfoBox icon="calendar" label="Fecha" value={s.fecha_preferida ? formatShortDate(s.fecha_preferida) : 'Abierta'} />
          <InfoBox icon="clock" label="Hora" value={s.hora_preferida ? formatTime12(s.hora_preferida) : 'Lo antes posible'} />
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Button title="Rechazar" variant="outlined" onPress={onReject} loading={busy === 'd'} disabled={!!busy} style={styles.flex} full />
        <Button title="Aceptar trabajo" variant="accent" onPress={onAccept} loading={busy === 'a'} disabled={!!busy || !canAccept} style={styles.flex} full />
      </View>
    </Surface>
  );
}

export function InfoBox({ icon, label, value }: { icon?: IconName; label: string; value: string }) {
  return (
    <View style={styles.box} accessibilityLabel={`${label}: ${value}`}>
      {icon ? <Icon name={icon} size={18} color={color.inkSoft} /> : null}
      <View style={styles.flex}>
        <Text variant="overline" tone="muted" style={styles.boxLabel}>{label}</Text>
        <Text variant="subtitle" weight="700" numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginBottom: space.md, overflow: 'hidden' },
  strip: { backgroundColor: color.navy, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  body: { padding: space.lg, gap: space.xs },
  who: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  chip: { backgroundColor: color.groundAlt, borderRadius: radius.xs, paddingHorizontal: space.sm, paddingVertical: 6, maxWidth: '45%', marginTop: 4 },
  desc: { backgroundColor: color.groundAlt, borderRadius: radius.md, padding: space.md, gap: space.xs, marginTop: space.md },
  italic: { fontStyle: 'italic' },
  boxes: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  box: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.groundAlt, borderRadius: radius.md, padding: space.md },
  boxLabel: { fontSize: 11 },
  actions: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.lg },
});
