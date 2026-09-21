import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getClientRequests, RequestStatus, ServiceRequest } from '../services/requestsApi';

const statusColors: Record<RequestStatus, { background: string; text: string }> = {
  PENDIENTE: { background: '#FFF7ED', text: '#C2410C' },
  ASIGNADA: { background: '#EFF6FF', text: '#2563EB' },
    EN_CAMINO: { background: '#FFF7ED', text: '#EA580C' },
  EN_PROCESO: { background: '#F5F3FF', text: '#7C3AED' },
  FINALIZADA: { background: '#ECFDF5', text: '#15803D' },
  CANCELADA: { background: '#FEF2F2', text: '#DC2626' },
};

function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha definida';
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async (isRefresh = false) => {
    setError('');
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      setRequests(await getClientRequests());
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'No se pudieron cargar tus solicitudes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/client-dashboard' as any)} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Solicitudes</Text>
        <TouchableOpacity onPress={() => loadRequests(true)} accessibilityLabel="Actualizar solicitudes">
          <Feather name="refresh-cw" size={19} color="#7A8C9E" />
        </TouchableOpacity>
      </View>

      {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#0A192F" /></View> : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRequests(true)} />}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!error && requests.length === 0 ? <Text style={styles.empty}>Aún no tienes solicitudes registradas.</Text> : null}
          {requests.map(request => {
            const colors = statusColors[request.estado] || statusColors.PENDIENTE;
            return (
              <View key={request.id_solicitud} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.folio}>{request.folio}</Text>
                    <Text style={styles.date}>Solicitada: {formatDate(request.fecha_creacion)}</Text>
                  </View>
                  <View style={[styles.status, { backgroundColor: colors.background }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>{request.estado}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}><Feather name="map-pin" size={14} color="#7A8C9E" /><Text style={styles.detail}>{request.direccion}</Text></View>
                <View style={styles.detailRow}><Feather name="calendar" size={14} color="#7A8C9E" /><Text style={styles.detail}>{request.fecha_preferida || 'Fecha abierta'} · {request.hora_preferida || 'Hora abierta'}</Text></View>
                <Text style={styles.description} numberOfLines={2}>{request.descripcion}</Text>
                {request.estado === 'FINALIZADA' && !request.calificacion && <TouchableOpacity style={styles.rateButton} onPress={() => router.push({ pathname: '/service-finished', params: { id: String(request.id_solicitud), folio: request.folio } } as any)}>
                  <Feather name="star" size={14} color="#FFFFFF" /><Text style={styles.rateButtonText}>CALIFICAR SERVICIO</Text>
                </TouchableOpacity>}
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/client-dashboard' as any)}><Feather name="home" size={24} color="#C4CDD5" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Feather name="clock" size={24} color="#0A192F" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/client-profile' as any)}><Feather name="user" size={24} color="#C4CDD5" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 4 },
  headerTitle: { color: '#0A192F', fontSize: 21, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 110 },
  card: { borderWidth: 1, borderColor: '#E8EEF3', borderRadius: 10, padding: 17, marginBottom: 14, backgroundColor: '#FFFFFF' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  folio: { color: '#0A192F', fontSize: 15, fontWeight: '800' },
  date: { color: '#9CA8B6', fontSize: 11, marginTop: 4 },
  status: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 5 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detail: { flex: 1, color: '#506174', fontSize: 12, marginLeft: 8 },
  description: { color: '#0A192F', fontSize: 13, lineHeight: 19, marginTop: 6 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#7A8C9E', textAlign: 'center', marginTop: 50 },
  error: { color: '#B91C1C', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 6, marginBottom: 14 },
  rateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A192F', borderRadius: 5, paddingVertical: 12, marginTop: 14 },
  rateButtonText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginLeft: 7 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },
});
