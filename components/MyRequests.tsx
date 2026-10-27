import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getClientRequests, RequestStatus, ServiceRequest } from '../services/requestsApi';

const statusColors: Record<RequestStatus, { background: string; text: string }> = {
  PENDIENTE: { background: '#FEF3C7', text: '#D97706' },
  ASIGNADA: { background: '#E0E7FF', text: '#4338CA' },
  ESPERANDO_APROBACION: { background: '#FEF3C7', text: '#B45309' },
  EN_CAMINO: { background: '#FFF7ED', text: '#EA580C' },
  EN_PROCESO: { background: '#F3E5F5', text: '#7E22CE' },
  FINALIZADA: { background: '#DCFCE7', text: '#15803D' },
  CANCELADA: { background: '#FEE2E2', text: '#DC2626' },
};

function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha definida';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const day = d.getDate();
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} de ${month}, ${year}`;
  } catch (e) {
    return value;
  }
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
      console.log("🚨 ERROR EN MIS SOLICITUDES:", requestError?.response?.data || requestError?.message || requestError);
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

      {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#FF6B1A" /></View> : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRequests(true)} />}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!error && requests.length === 0 ? <Text style={styles.empty}>Aún no tienes solicitudes registradas.</Text> : null}
          {requests.map(request => {
            const currentStatus = request.estado || 'PENDIENTE';
            const colors = statusColors[currentStatus] || statusColors.PENDIENTE;
            const isActive = ['ASIGNADA', 'ESPERANDO_APROBACION', 'EN_CAMINO', 'EN_PROCESO'].includes(currentStatus);
            return (
              <TouchableOpacity
                key={request.id_solicitud}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => {
                  router.push({ pathname: '/order-status', params: { id: String(request.id_solicitud) } } as any);
                }}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.folio}>{request.folio || 'SRV-000'}</Text>
                    <Text style={styles.date}>Solicitada: {formatDate(request.fecha_creacion)}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: colors.background }]}
                    onPress={() => {
                      router.push({ pathname: '/order-status', params: { id: String(request.id_solicitud) } } as any);
                    }}
                  >
                    <Text style={[styles.statusText, { color: colors.text }]}>{currentStatus.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="map-pin" size={14} color="#FF6B1A" />
                  <Text style={styles.detail}>{request.direccion || 'Sin dirección registrada'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="calendar" size={14} color="#7A8C9E" />
                  <Text style={styles.detail}>{request.fecha_preferida || 'Fecha abierta'} · {request.hora_preferida || 'Hora abierta'}</Text>
                </View>

                {request.tecnico_nombre ? (
                  <View style={styles.detailRow}>
                    <Feather name="user" size={14} color="#15803D" />
                    <Text style={[styles.detail, { color: '#15803D', fontWeight: '700' }]}>
                      Técnico: {request.tecnico_nombre} {request.tecnico_apellido || ''}
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.description} numberOfLines={2}>{request.descripcion || 'Sin descripción'}</Text>

                {isActive && (
                  <View style={{ flexDirection: 'column', marginTop: 16, gap: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={styles.pillButtonPrimary}
                        onPress={() => router.push({ pathname: '/order-status', params: { id: String(request.id_solicitud) } } as any)}
                      >
                        <Feather name="file-text" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.pillButtonTextText}>DETALLES</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pillButtonSuccess}
                        onPress={() => router.push({ pathname: '/tech-active-service', params: { id: String(request.id_solicitud) } } as any)}
                      >
                        <Feather name="map-pin" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.pillButtonTextText}>MAPA</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.pillButtonOutline}
                      onPress={() => router.push({ pathname: '/tech-client-chat', params: { id: String(request.id_solicitud) } } as any)}
                    >
                      <Feather name="message-circle" size={14} color="#FF6B1A" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#FF6B1A', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>CHAT</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {request.estado === 'FINALIZADA' && !request.calificacion && (
                  <TouchableOpacity 
                    style={styles.rateButtonPill} 
                    onPress={() => router.push({ pathname: '/service-finished', params: { id: String(request.id_solicitud), folio: request.folio } } as any)}
                  >
                    <Feather name="star" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.rateButtonText}>CALIFICAR</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/client-dashboard' as any)}>
          <Feather name="home" size={22} color="#7A8C9E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNavDot} />
          <Feather name="clock" size={22} color="#FF6B1A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/client-profile' as any)}>
          <Feather name="user" size={22} color="#7A8C9E" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF3' },
  backButton: { padding: 4 },
  headerTitle: { color: '#0A192F', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  content: { padding: 18, paddingBottom: 100 },
  
  /* Tarjetas Flotantes Blanco Puro (#FFFFFF) con Sombra Suave */
  card: { 
    borderWidth: 1, 
    borderColor: '#F0F4F8', 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 16, 
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  folio: { color: '#0A192F', fontSize: 16, fontWeight: '800' },
  date: { color: '#7A8C9E', fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detail: { flex: 1, color: '#4A5568', fontSize: 12, marginLeft: 8, fontWeight: '500' },
  description: { color: '#0A192F', fontSize: 13, lineHeight: 19, marginTop: 6, fontWeight: '500' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#7A8C9E', textAlign: 'center', marginTop: 50, fontWeight: '600' },
  error: { color: '#B91C1C', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14 },

  /* Botones Tipo Pastilla Naranja Vibrante (#FF6B1A) y Estilos Modernos */
  pillButtonPrimary: {
    flex: 1,
    backgroundColor: '#FF6B1A',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  pillButtonSuccess: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  pillButtonOutline: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFD8BE',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pillButtonTextText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  rateButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B1A',
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 16,
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rateButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginLeft: 8 },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF3',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10, position: 'relative' },
  activeNavDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6B1A', position: 'absolute', top: 4 },
});
