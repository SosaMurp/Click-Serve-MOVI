import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Avatar, Banner, color, Screen, Skeleton, space, Text } from '@/src/design';
import { useSession } from '@/src/state/session';
import { fileUrl } from '@/src/api/client';
import { BigAction } from '@/src/features/orders/BigAction';
import { TodayCard } from '@/src/features/orders/TodayCard';
import { activeOrders, needsClientAction, useMisSolicitudes } from '@/src/features/orders/hooks';

// Inicio del cliente con el enfoque de CILIM: un saludo, el servicio en curso (si hay) con una sola
// acción, y tres acciones grandes con texto. Las categorías viven en "Pedir un servicio";
// el historial, en "Mis servicios".
export default function Inicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { data, loading, refreshing, refresh } = useMisSolicitudes();

  const activas = activeOrders(data);
  const pendientes = activas.filter(needsClientAction);
  const hoy = pendientes[0] || activas[0];
  const open = (id: number) => router.push({ pathname: '/orden/[id]', params: { id: String(id) } });

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
      <StatusBar style="dark" />
      <View style={styles.headerInner}>
        <View style={styles.flex}>
          <Text variant="bodyLg" tone="soft">Hola,</Text>
          <Text variant="display" numberOfLines={1} accessibilityRole="header">{user?.nombre || 'bienvenido'}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Ver mi cuenta" onPress={() => router.push('/cuenta')} hitSlop={8}>
          <Avatar uri={fileUrl(user?.foto_url)} nombre={user?.nombre} apellido={user?.apellido} size={56} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <Screen inTabs refreshing={refreshing} onRefresh={refresh} header={header}>
      {user && !user.aprobado ? (
        <Banner tone="warning" title="Tu cuenta está en revisión" body="Revisamos tus documentos. Podrás pedir servicios en cuanto quede aprobada." style={styles.block} />
      ) : null}

      {loading && !data ? <Skeleton height={180} style={styles.block} /> : null}
      {hoy ? <TodayCard s={hoy} onOpen={() => open(hoy.id_solicitud)} /> : null}

      <BigAction
        icon="plus"
        title="Pedir un servicio"
        subtitle="Electricidad, plomería, cómputo y más"
        onPress={() => router.push('/nueva-solicitud')}
        highlight={!hoy}
      />
      <BigAction
        icon="clipboard"
        title="Mis servicios"
        subtitle={activas.length ? `${activas.length} en curso` : 'Lo que has pedido'}
        badge={pendientes.length ? `${pendientes.length === 1 ? 'Uno necesita' : `${pendientes.length} necesitan`} tu respuesta` : undefined}
        onPress={() => router.push('/servicios')}
      />
      <BigAction icon="help-circle" title="Ayuda" subtitle="Preguntas frecuentes y soporte" onPress={() => router.push('/ayuda')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { backgroundColor: color.ground, alignItems: 'center' },
  headerInner: { width: '100%', maxWidth: 640, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.sm },
  block: { marginBottom: space.lg },
});
