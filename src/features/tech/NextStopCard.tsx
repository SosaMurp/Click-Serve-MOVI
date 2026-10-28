import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Button, color, Icon, space, Surface, Text } from '../../design';
import type { Solicitud } from '../../api/types';
import { estadoInfo } from '../../lib/estado';
import { etaMinutes, formatShortDate, formatTime12 } from '../../lib/format';
import { InfoBox } from './RequestCard';

const whenText = (s: Solicitud) => {
  const dia = s.fecha_preferida ? formatShortDate(s.fecha_preferida) : 'Hoy';
  return s.hora_preferida ? `${dia} · ${formatTime12(s.hora_preferida)}` : dia;
};

// "SIGUIENTE DESTINO" (referencia, pestaña En curso): cliente, zona y categoría, CITA y ESTATUS,
// CHAT y VER EN MAPA. La ETA solo se muestra mientras el técnico va hacia el domicilio.
export function NextStopCard({ s, onChat, onMap, onOpen }: { s: Solicitud; onChat: () => void; onMap: () => void; onOpen: () => void }) {
  const cliente = `${s.cliente_nombre || 'Cliente'} ${s.cliente_apellido || ''}`.trim();
  const eta = ['ASIGNADA', 'EN_CAMINO'].includes(s.estado) ? etaMinutes(s.distancia_km) : null;
  return (
    <View>
      <View style={styles.head}>
        <Text variant="overline" tone="muted" style={styles.flex}>Siguiente destino</Text>
        {eta ? <Text variant="overline" tone="success">ETA: {eta} min</Text> : null}
      </View>
      <Surface style={styles.card}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver el trabajo de ${cliente}`} onPress={onOpen}>
          <View style={styles.who}>
            <View style={styles.flex}>
              <Text variant="headline" numberOfLines={2}>{cliente}</Text>
              <Text variant="overline" tone="muted" numberOfLines={1}>{[s.zona, s.categoria_nombre].filter(Boolean).join(' · ')}</Text>
            </View>
            <Avatar nombre={s.cliente_nombre} apellido={s.cliente_apellido} size={48} />
          </View>
          <View style={styles.boxes}>
            <InfoBox label="Cita" value={whenText(s)} />
            <InfoBox label="Estatus" value={estadoInfo(s.estado, 'tecnico').label.toUpperCase()} />
          </View>
        </Pressable>
        <View style={styles.actions}>
          <Button title="Chat" variant="outlined" icon="message-circle" onPress={onChat} style={styles.flex} full />
          <Button title="Ver en mapa" variant="accent" icon="map-pin" onPress={onMap} style={styles.flex} full />
        </View>
      </Surface>
    </View>
  );
}

// Fila de "PROGRAMADO": cliente, zona y categoría, y la hora a la derecha.
export function ScheduledRow({ s, onPress }: { s: Solicitud; onPress: () => void }) {
  const cliente = `${s.cliente_nombre || 'Cliente'} ${s.cliente_apellido || ''}`.trim();
  return (
    <Surface onPress={onPress} accessibilityLabel={`${cliente}, ${s.categoria_nombre}`} style={styles.row}>
      <View style={styles.rowIcon}><Icon name="user" size={18} color={color.inkSoft} /></View>
      <View style={styles.flex}>
        <Text variant="subtitle" weight="700" numberOfLines={1}>{cliente}</Text>
        <Text variant="overline" tone="muted" numberOfLines={1}>{[s.zona, s.categoria_nombre].filter(Boolean).join(' · ')}</Text>
      </View>
      <View style={styles.time}>
        <Text variant="subtitle" weight="700" tabular>{s.hora_preferida ? formatTime12(s.hora_preferida) : '—'}</Text>
        <Text variant="overline" tone="muted">{s.fecha_preferida ? formatShortDate(s.fecha_preferida) : 'Abierta'}</Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  card: { marginBottom: space.lg },
  who: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  boxes: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.groundAlt, alignItems: 'center', justifyContent: 'center' },
  time: { alignItems: 'flex-end' },
});
