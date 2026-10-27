import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MetricBox, space, Surface, Text } from '@/src/design';
import { ProfileScreen } from '@/src/features/account/ProfileScreen';
import { useMisSolicitudes } from '@/src/features/orders/hooks';

export default function Cuenta() {
  const { data } = useMisSolicitudes();
  const lista = data || [];
  const calificadas = lista.filter((s) => s.calificacion_al_tecnico);
  return (
    <ProfileScreen
      metrics={(
        <Surface tint="sky" style={styles.metrics}>
          <Text variant="title">Tu actividad</Text>
          <View style={styles.row}>
            <MetricBox value={lista.length} label="Solicitados" tone="brand" />
            <MetricBox value={lista.filter((s) => s.estado === 'FINALIZADA').length} label="Terminados" />
            <MetricBox value={calificadas.length} label="Reseñas dadas" />
          </View>
        </Surface>
      )}
      sections={[
        {
          title: 'Tu cuenta',
          items: [
            { icon: 'map-pin', title: 'Mis direcciones', subtitle: 'Casa, trabajo y otros domicilios', href: '/direcciones', tone: 'brand' },
            { icon: 'credit-card', title: 'Métodos de pago', subtitle: 'Tarjetas guardadas de forma segura', href: '/tarjetas', tone: 'accent' },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  metrics: { marginTop: space.lg },
  row: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
});
