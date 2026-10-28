import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Avatar, color, radius, space, Text } from '../../design';
import type { ResumenTecnico } from '../../api/types';
import { formatMoney } from '../../lib/format';
import { useAvailability } from '../../state/availability';

// Encabezado del Panel de Trabajo (referencia): título, píldora ONLINE/OFFLINE que enciende y apaga
// la disponibilidad (RF-21) y "TÉC. NOMBRE · LÁZARO CÁRDENAS". Debajo, las cifras de la semana (RF-111/122).
// El avatar a la derecha lleva al perfil (RF-86).
export function PanelHeader({ nombre, apellido, fotoUrl, onAvatar, resumen }: { nombre?: string | null; apellido?: string | null; fotoUrl?: string | null; onAvatar: () => void; resumen: ResumenTecnico | null }) {
  const insets = useSafeAreaInsets();
  const { disponible, cambiando, setDisponible } = useAvailability();
  const quien = [nombre, apellido ? `${apellido.trim()[0]}.` : ''].filter(Boolean).join(' ');
  const cifras = [
    { label: 'Esta semana', value: resumen ? formatMoney(resumen.ganancias_semana) : '—' },
    { label: 'Servicios', value: String(resumen?.servicios_semana ?? '—') },
    { label: 'Calificación', value: resumen?.calificacion || '—' },
    { label: 'Saldo', value: resumen ? formatMoney(resumen.saldo) : '—' },
  ];
  return (
    <View style={[styles.band, { paddingTop: insets.top + space.md }]}>
      <StatusBar style="dark" />
      <View style={styles.inner}>
        <View style={styles.top}>
          <Text variant="headline" style={styles.flex} accessibilityRole="header">Panel de Trabajo</Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Disponible para recibir trabajos"
            accessibilityState={{ checked: disponible, busy: cambiando }}
            onPress={() => !cambiando && setDisponible(!disponible)}
            hitSlop={8}
            style={[styles.pill, disponible ? styles.pillOn : styles.pillOff]}
          >
            {cambiando ? <ActivityIndicator size="small" color={disponible ? color.successInk : color.inkSoft} /> : <View style={[styles.dot, { backgroundColor: disponible ? color.success : color.inkMuted }]} />}
            <Text variant="overline" style={{ color: disponible ? color.successInk : color.inkSoft }}>{disponible ? 'Online' : 'Offline'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Ir a mi perfil" onPress={onAvatar} hitSlop={6}>
            <Avatar uri={fotoUrl} nombre={nombre} apellido={apellido} size={40} />
          </Pressable>
        </View>
        <Text variant="overline" tone="muted">Téc. {quien} · Lázaro Cárdenas</Text>
        <View style={styles.cifras}>
          {cifras.map((c) => (
            <View key={c.label} style={styles.cifra} accessibilityLabel={`${c.label}: ${c.value}`}>
              <Text variant="subtitle" weight="700" numberOfLines={1} adjustsFontSizeToFit tabular>{c.value}</Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  band: { backgroundColor: color.ground, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 640, paddingHorizontal: space.lg, gap: space.xs },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: space.md, borderRadius: radius.full, borderWidth: 1 },
  pillOn: { backgroundColor: color.successSoft, borderColor: color.successSoft },
  pillOff: { backgroundColor: color.groundAlt, borderColor: color.line },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cifras: { flexDirection: 'row', gap: space.sm, marginTop: space.md, backgroundColor: color.groundAlt, borderRadius: radius.md, padding: space.md },
  cifra: { flex: 1, alignItems: 'center', gap: 2 },
});
