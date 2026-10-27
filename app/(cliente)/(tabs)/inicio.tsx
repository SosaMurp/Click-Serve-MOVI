import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Banner, color, FloatingAction, font, HomeHeader, Icon, IconName, MetricBox, radius, Screen, SectionHeader, Skeleton, space, Surface, Text,
} from '@/src/design';
import { useSession } from '@/src/state/session';
import { fileUrl } from '@/src/api/client';
import { OrderCard } from '@/src/features/orders/OrderCard';
import { OrderHero } from '@/src/features/orders/OrderHero';
import { activeOrders, needsClientAction, useCategorias, useMisSolicitudes } from '@/src/features/orders/hooks';

// Inicio del cliente: buscar qué arreglar, seguir lo que está en curso y ver su historial reciente.
export default function Inicio() {
  const router = useRouter();
  const { user } = useSession();
  const { data, loading, refreshing, refresh } = useMisSolicitudes();
  const categorias = useCategorias();
  const [query, setQuery] = useState('');

  const activas = activeOrders(data);
  const pendientes = activas.filter(needsClientAction).length;
  const finalizadas = (data || []).filter((s) => s.estado === 'FINALIZADA').length;
  const recientes = (data || []).filter((s) => !activas.includes(s)).slice(0, 2);
  const startRequest = (params: Record<string, string> = {}) => router.push({ pathname: '/nueva-solicitud', params });

  return (
    <View style={styles.flex}>
      <Screen
        inTabs
        refreshing={refreshing}
        onRefresh={refresh}
        contentStyle={{ paddingBottom: 96 }}
        header={(
          <HomeHeader
            nombre={user?.nombre}
            apellido={user?.apellido}
            fotoUrl={fileUrl(user?.foto_url)}
            onAvatar={() => router.push('/cuenta')}
            actions={[
              { icon: 'help-circle', label: 'Ayuda', onPress: () => router.push('/ayuda') },
              { icon: 'bell', label: 'Servicios que requieren tu atención', onPress: () => router.push('/servicios'), badge: pendientes > 0 },
            ]}
          />
        )}
      >
        <Text variant="display" style={styles.title} accessibilityRole="header">¿Qué necesitas{'\n'}arreglar hoy?</Text>

        {user && !user.aprobado ? (
          <Banner tone="warning" title="Tu cuenta está en revisión" body="Revisamos tus documentos. Podrás pedir servicios en cuanto quede aprobada." style={styles.block} />
        ) : null}

        <View style={styles.prompt}>
          <Text variant="title">Describe la falla</Text>
          <View style={styles.search}>
            <Icon name="search" size={20} color={color.inkMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ej. el contacto de la cocina hace chispa"
              placeholderTextColor={color.inkMuted}
              style={styles.searchInput}
              returnKeyType="go"
              onSubmitEditing={() => startRequest(query.trim() ? { descripcion: query.trim() } : {})}
              accessibilityLabel="Describe la falla"
            />
          </View>
          <Pressable accessibilityRole="button" onPress={() => startRequest({ ...(query.trim() ? { descripcion: query.trim() } : {}), automatica: '1' })} style={styles.surprise}>
            <Icon name="zap" size={16} color={color.brandInk} />
            <Text variant="label" tone="brand">Lo antes posible, con el más cercano</Text>
          </Pressable>
        </View>

        {loading ? <Skeleton height={190} style={styles.block} /> : null}
        {activas.length ? (
          <>
            <SectionHeader title="En curso" onAction={() => router.push('/servicios')} />
            {activas.slice(0, 2).map((s) => (
              <Pressable key={s.id_solicitud} accessibilityRole="button" accessibilityLabel={`Ver ${s.categoria_nombre}`} onPress={() => router.push({ pathname: '/orden/[id]', params: { id: String(s.id_solicitud) } })} style={styles.block}>
                <OrderHero s={s} />
              </Pressable>
            ))}
          </>
        ) : !loading && data ? (
          <Surface tint="sky" style={{ ...styles.block, marginTop: space.lg }}>
            <Text variant="title">Tus servicios</Text>
            <View style={styles.metrics}>
              <MetricBox value={(data || []).length} label="Solicitados" tone="brand" />
              <MetricBox value={finalizadas} label="Terminados" />
              <MetricBox value={activas.length} label="En curso" />
            </View>
          </Surface>
        ) : null}

        <SectionHeader title="Categorías" />
        <View style={styles.grid}>
          {categorias.map((c, i) => (
            <Pressable
              key={c.codigo}
              accessibilityRole="button"
              accessibilityLabel={`Pedir ${c.nombre}`}
              onPress={() => startRequest({ categoria: c.codigo })}
              style={({ pressed }) => [styles.cat, { backgroundColor: i % 3 === 0 ? color.brandSoft : i % 3 === 1 ? color.accentSoft : color.surface }, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.catIcon}><Icon name={(c.icono as IconName) || 'tool'} size={20} color={color.brandInk} /></View>
              <Text variant="subtitle" numberOfLines={2}>{c.nombre}</Text>
            </Pressable>
          ))}
          {!categorias.length ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={104} width="48%" />) : null}
        </View>

        {recientes.length ? (
          <>
            <SectionHeader title="Recientes" onAction={() => router.push('/servicios')} />
            {recientes.map((s) => (
              <OrderCard key={s.id_solicitud} s={s} rol="cliente" onPress={() => router.push({ pathname: '/orden/[id]', params: { id: String(s.id_solicitud) } })} />
            ))}
          </>
        ) : null}
      </Screen>
      <FloatingAction title="Nueva solicitud" onPress={() => startRequest()} bottom={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { marginTop: space.sm, marginBottom: space.lg },
  block: { marginBottom: space.md },
  prompt: { backgroundColor: color.accentSoft, borderRadius: radius.lg, padding: space.lg, gap: space.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.surface, borderRadius: radius.md, paddingHorizontal: space.lg, minHeight: 56 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: font.body, color: color.ink, minHeight: 48, outlineStyle: 'none' } as object,
  surprise: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 48, borderRadius: radius.md, backgroundColor: color.brandSoft, paddingHorizontal: space.md },
  metrics: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'space-between' },
  cat: { width: '48%', minHeight: 104, borderRadius: radius.lg, padding: space.lg, gap: space.md, justifyContent: 'space-between' },
  catIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
});
