import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Avatar, Button, EmptyState, ListItem, Pill, Screen, SectionHeader, SkeletonList, space, Surface, Text } from '@/src/design';
import { fileUrl } from '@/src/api/client';
import { soporteApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { formatRelative } from '@/src/lib/format';
import { useMisSolicitudes } from '@/src/features/orders/hooks';
import { ticketTone } from '@/src/features/chat/ticket';

// Conversaciones: con el técnico de cada servicio (RF-112) y con soporte (RF-107).
export default function Mensajes() {
  const router = useRouter();
  const ordenes = useMisSolicitudes();
  const tickets = useLoader(() => soporteApi.tickets().then((r) => r.tickets), []);
  const conTecnico = (ordenes.data || []).filter((s) => s.tecnico && s.estado !== 'CANCELADA').slice(0, 10);

  return (
    <Screen inTabs refreshing={ordenes.refreshing} onRefresh={() => { ordenes.refresh(); tickets.reload(); }} header={<AppBar title="Mensajes" back={false} />}>
      <SectionHeader title="Con tu técnico" />
      {ordenes.loading ? <SkeletonList rows={2} /> : null}
      {!ordenes.loading && !conTecnico.length ? (
        <Surface><Text variant="body" tone="muted">Cuando un técnico acepte tu solicitud podrás escribirle desde aquí.</Text></Surface>
      ) : null}
      {conTecnico.length ? (
        <Surface padded={false}>
          {conTecnico.map((s) => (
            <View key={s.id_solicitud} style={styles.row}>
              <Avatar uri={fileUrl(s.tecnico?.foto_url)} nombre={s.tecnico?.nombre} apellido={s.tecnico?.apellido} size={44} />
              <View style={styles.flex}>
                <Text variant="subtitle" numberOfLines={1}>{s.tecnico?.nombre} {s.tecnico?.apellido}</Text>
                <Text variant="bodySm" tone="muted" numberOfLines={1}>{s.categoria_nombre} · {s.folio}</Text>
              </View>
              <Button title="Abrir" variant="tonal" onPress={() => router.push({ pathname: '/chat/[id]', params: { id: String(s.id_solicitud) } })} />
            </View>
          ))}
        </Surface>
      ) : null}

      <SectionHeader title="Soporte" action="Nuevo caso" onAction={() => router.push('/soporte/nuevo')} />
      {tickets.loading ? <SkeletonList rows={1} /> : null}
      {!tickets.loading && !(tickets.data || []).length ? (
        <EmptyState icon="life-buoy" title="Sin casos de soporte" body="¿Algo salió mal? Escríbenos y te atendemos por chat." action={<Button title="Contactar a soporte" icon="message-circle" onPress={() => router.push('/soporte/nuevo')} />} />
      ) : null}
      {(tickets.data || []).length ? (
        <Surface padded={false}>
          {(tickets.data || []).map((t) => (
            <ListItem
              key={t.id_ticket}
              icon="life-buoy"
              iconTone={t.prioridad === 'ALTA' ? 'danger' : 'brand'}
              title={t.asunto}
              subtitle={`${t.folio} · ${t.ultimo_mensaje || ''}`}
              trailing={<View style={styles.trailing}><Pill label={ticketTone(t).label} tone={ticketTone(t).tone} size="sm" /><Text variant="caption" tone="muted">{formatRelative(t.fecha_actualizacion)}</Text></View>}
              onPress={() => router.push({ pathname: '/soporte/[id]', params: { id: String(t.id_ticket) } })}
            />
          ))}
        </Surface>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  trailing: { alignItems: 'flex-end', gap: 4 },
});
