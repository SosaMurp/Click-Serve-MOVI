import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, color, radius, space, Text } from '../../design';
import type { Solicitud } from '../../api/types';
import { clientStatusText } from '../../lib/estado';

// "Tu servicio de hoy" en el inicio del cliente: qué pasa en una frase y un solo botón.
// Si le toca hacer algo (aprobar el precio, confirmar y pagar) el botón lo dice y va en naranja.
export function TodayCard({ s, onOpen }: { s: Solicitud; onOpen: () => void }) {
  const t = clientStatusText(s);
  return (
    <View style={[styles.card, t.accion ? styles.cardAction : null]} accessibilityRole="summary">
      <Text variant="overline" tone="muted">Tu servicio · {s.categoria_nombre}</Text>
      <Text variant="headline" style={styles.title}>{t.titulo}</Text>
      <Text variant="bodyLg" tone="soft">{t.detalle}</Text>
      <Button title={t.accion || 'Ver mi servicio'} variant={t.accion ? 'accent' : 'primary'} onPress={onOpen} full size="xl" style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: color.surface, padding: space.lg, gap: space.xs, marginBottom: space.lg },
  cardAction: { borderColor: color.accentStrong, borderWidth: 2 },
  title: { marginTop: space.xs },
  btn: { marginTop: space.md },
});
