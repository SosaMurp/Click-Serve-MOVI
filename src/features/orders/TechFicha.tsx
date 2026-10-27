import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, color, Icon, IconName, RatingStars, space, Text } from '../../design';
import { fileUrl } from '../../api/client';
import { formatDistance } from '../../lib/format';

type Props = {
  nombre: string;
  apellido: string;
  foto_url: string | null;
  calificacion: string | null;
  resenas?: number;
  trabajos: number;
  verificado_sep: boolean;
  distancia_km?: number | null;
  eta_min?: number | null;
  especialidades?: string[];
  right?: React.ReactNode;
};

// Ficha del técnico: siempre los mismos datos en el mismo lugar (foto, nombre, calificación,
// trabajos, distancia, insignias), para que comparar sea un vistazo.
export function TechFicha({ nombre, apellido, foto_url, calificacion, resenas, trabajos, verificado_sep, distancia_km, eta_min, especialidades, right }: Props) {
  const rating = calificacion ? Number(calificacion) : 0;
  return (
    <View style={styles.row}>
      <Avatar uri={fileUrl(foto_url)} nombre={nombre} apellido={apellido} size={56} />
      <View style={styles.flex}>
        <View style={styles.nameRow}>
          <Text variant="subtitle" numberOfLines={1} style={styles.name}>{nombre} {apellido}</Text>
          <Badge icon="shield" label="Identidad verificada" tone="success" />
          {verificado_sep ? <Badge icon="award" label="Cédula SEP" tone="brand" /> : null}
        </View>
        <View style={styles.line}>
          {rating ? <RatingStars value={rating} size={14} /> : null}
          <Text variant="caption" tone="muted" tabular>
            {rating ? `${calificacion} · ${resenas ?? 0} reseña${resenas === 1 ? '' : 's'}` : 'Sin reseñas aún'} · {trabajos} trabajo{trabajos === 1 ? '' : 's'}
          </Text>
        </View>
        {distancia_km != null ? (
          <View style={styles.line}>
            <Icon name="navigation" size={14} color={color.inkMuted} />
            <Text variant="caption" tone="muted">{formatDistance(distancia_km)}{eta_min ? ` · llega en ~${eta_min} min` : ''}</Text>
          </View>
        ) : null}
        {especialidades?.length ? <Text variant="caption" tone="soft" numberOfLines={1}>{especialidades.join(' · ')}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function Badge({ icon, label, tone }: { icon: IconName; label: string; tone: 'success' | 'brand' }) {
  return (
    <View accessibilityLabel={label} style={[styles.badge, { backgroundColor: tone === 'success' ? color.successSoft : color.brandSoft }]}>
      <Icon name={icon} size={13} color={tone === 'success' ? color.successInk : color.brandInk} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  badge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
