import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Button, EmptyState, ListItem, Pill, Screen, SkeletonList, space, Surface, Text } from '@/src/design';
import { soporteApi } from '@/src/api/endpoints';
import { ticketTone } from '@/src/features/chat/ticket';
import { useLoader } from '@/src/lib/useLoader';
import { formatRelative } from '@/src/lib/format';

// RF-107/94: casos de soporte del usuario.
export default function Soporte() {
  const router = useRouter();
  const { data, loading, refreshing, refresh } = useLoader(() => soporteApi.tickets().then((r) => r.tickets), []);
  const list = data || [];
  return (
    <Screen
      header={<AppBar title="Soporte" />}
      refreshing={refreshing}
      onRefresh={refresh}
      footer={<Button title="Nuevo caso" icon="plus" onPress={() => router.push('/soporte/nuevo')} full size="lg" />}
    >
      <Surface tint="peach">
        <Text variant="title">¿En qué te ayudamos?</Text>
        <Text variant="bodySm" tone="soft">Un asesor responde por chat. Los casos de seguridad se atienden de inmediato.</Text>
        <Button title="Ver centro de ayuda" variant="white" icon="book-open" onPress={() => router.push('/ayuda')} style={styles.mt} />
      </Surface>
      <Text variant="title" style={styles.title}>Tus casos</Text>
      {loading ? <SkeletonList rows={2} /> : null}
      {!loading && !list.length ? <EmptyState icon="life-buoy" title="Sin casos" body="Cuando abras un caso aparecerá aquí con su folio." /> : null}
      {list.length ? (
        <Surface padded={false}>
          {list.map((t) => {
            const st = ticketTone(t);
            return (
              <ListItem
                key={t.id_ticket}
                icon={t.categoria === 'SEGURIDAD' ? 'shield' : t.categoria === 'PAGOS' ? 'credit-card' : 'message-circle'}
                iconTone={st.tone === 'danger' ? 'danger' : 'brand'}
                title={t.asunto}
                subtitle={`${t.folio}${t.folio_solicitud ? ` · ${t.folio_solicitud}` : ''}${t.ultimo_mensaje ? `\n${t.ultimo_mensaje}` : ''}`}
                trailing={<View style={styles.trailing}><Pill label={st.label} tone={st.tone} size="sm" /><Text variant="caption" tone="muted">{formatRelative(t.fecha_actualizacion)}</Text></View>}
                onPress={() => router.push({ pathname: '/soporte/[id]', params: { id: String(t.id_ticket) } })}
              />
            );
          })}
        </Surface>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mt: { marginTop: space.md },
  title: { marginTop: space.xl, marginBottom: space.md },
  trailing: { alignItems: 'flex-end', gap: 4 },
});
