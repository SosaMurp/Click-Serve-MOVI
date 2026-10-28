import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, Icon, IconName, radius, space, Text } from '../../design';
import type { ResumenTecnico } from '../../api/types';
import { formatMoney } from '../../lib/format';
import { useAvailability } from '../../state/availability';

// RF-21: tarjeta héroe del técnico en azul marino liso.
export function OnlineCard({ resumen }: { resumen: ResumenTecnico | null }) {
  const { disponible, cambiando, setDisponible } = useAvailability();
  const colors = [color.navy, color.navy] as [string, string];
  const mini: { icon: IconName; label: string; value: string }[] = [
    { icon: 'bell', label: 'Nuevas', value: String(resumen?.contadores.nuevas ?? '—') },
    { icon: 'tool', label: 'En curso', value: String(resumen?.contadores.en_curso ?? '—') },
    { icon: 'star', label: 'Calif.', value: resumen?.calificacion || '—' },
    { icon: 'credit-card', label: 'Saldo', value: resumen ? formatMoney(resumen.saldo) : '—' },
  ];
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text variant="label" tone="onColor" style={styles.dim}>{disponible ? 'Estás en línea' : 'Estás desconectado'}</Text>
          <Text variant="title" tone="onColor">{disponible ? 'Recibiendo solicitudes cercanas' : 'Conéctate para recibir trabajos'}</Text>
        </View>
        <Switch
          value={disponible}
          disabled={cambiando}
          onValueChange={setDisponible}
          trackColor={{ false: 'rgba(255,255,255,0.35)', true: color.accent }}
          thumbColor={color.surface}
          accessibilityLabel="Disponible para recibir trabajos"
        />
      </View>
      <View style={styles.figures}>
        <View>
          <Text variant="caption" tone="onColor" style={styles.dim}>Ganado esta semana</Text>
          <Text variant="number" tone="onColor" tabular>{resumen ? formatMoney(resumen.ganancias_semana) : '—'}</Text>
        </View>
        <View>
          <Text variant="caption" tone="onColor" style={styles.dim}>Servicios</Text>
          <Text variant="number" tone="onColor" tabular>{resumen?.servicios_semana ?? '—'}</Text>
        </View>
      </View>
      <View style={styles.row}>
        {mini.map((m) => (
          <View key={m.label} style={styles.mini} accessibilityLabel={`${m.label}: ${m.value}`}>
            <View style={styles.miniIcon}><Icon name={m.icon} size={15} color={color.brandInk} /></View>
            <Text variant="label" numberOfLines={1} adjustsFontSizeToFit tabular>{m.value}</Text>
            <Text variant="caption" tone="muted" numberOfLines={1} style={styles.miniLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: radius.lg, padding: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  dim: { opacity: 0.85 },
  figures: { flexDirection: 'row', gap: space.xxl, marginTop: space.md },
  row: { flexDirection: 'row', gap: space.sm, backgroundColor: color.surface, borderRadius: radius.md, padding: space.md, marginTop: space.lg },
  mini: { flex: 1, alignItems: 'center', gap: 2 },
  miniIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  miniLabel: { fontSize: 11 },
});
