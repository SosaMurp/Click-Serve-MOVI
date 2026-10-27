import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { getTechnicianRequests, ServiceRequest, updateRequestStatus } from '../services/requestsApi';

export default function TechDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('historial'); // 'nuevas', 'en_curso', 'historial'
  const [technicianRequests, setTechnicianRequests] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const isTechnician = user?.id_rol === 2 || user?.perfil === 'tecnico' || user?.rol === 'tecnico';

  const loadTechnicianRequests = useCallback(async () => {
    if (!isTechnician) return;
    setRequestsLoading(true);
    try {
      setTechnicianRequests(await getTechnicianRequests());
    } catch (error: any) {
      Alert.alert('No se pudieron cargar solicitudes', error.response?.data?.error || 'Verifica tu conexión.');
    } finally {
      setRequestsLoading(false);
    }
  }, [isTechnician]);

  useEffect(() => {
    if (isTechnician) {
      loadTechnicianRequests();
    }
  }, [isTechnician, loadTechnicianRequests]);

  const userEmail = String(user?.correo || user?.email || '').trim().toLowerCase();
  const MASTER_EMAILS = ['jesusabar123@gmail.com', 'luisgallo123123@gmail.com', 'jesusabar123123@gmail.com'];
  const isMasterUser = MASTER_EMAILS.includes(userEmail);
  const isApproved = String(user?.estado || '').toUpperCase() === 'APROBADO' ||
                     String(user?.estado_cuenta || '').toUpperCase() === 'ACTIVO' ||
                     String(user?.estado_cuenta || '').toUpperCase() === 'APROBADO';

  const isPending = !isMasterUser && !isApproved && (
    user?.estado === 'pendiente' ||
    String(user?.estado || '').toLowerCase() === 'pendiente' ||
    user?.estado_cuenta === 'pendiente' ||
    user?.identidad_verificada === false ||
    user?.verificado === false
  );

  const decideRequest = async (request: ServiceRequest, estado: 'ASIGNADA' | 'CANCELADA') => {
    if (isPending) {
      Alert.alert(
        "En Revisión",
        "Tu cuenta de técnico se encuentra en revisión de documentos. No puedes aceptar o gestionar servicios hasta que tus credenciales sean aprobadas."
      );
      return;
    }
    try {
      await updateRequestStatus(request.id_solicitud, estado);
      await loadTechnicianRequests();
    } catch (error: any) {
      Alert.alert('No se pudo actualizar', error.response?.data?.error || 'La solicitud pudo ser tomada por otro técnico.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B1A" />
      </View>
    );
  }

  const renderHistorial = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>GANANCIAS SEMANALES</Text>
        <View style={styles.trendBadgePastel}>
          <Text style={styles.trendTextPastel}>+12% vs semana anterior</Text>
        </View>
      </View>

      <View style={styles.earningsAmountRow}>
        <Text style={styles.earningsAmount}>$2,850.00</Text>
        <Text style={styles.earningsCurrency}>MXN</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SERVICIOS</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>HORAS</Text>
          <Text style={styles.statValue}>18.5</Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ACTIVIDAD RECIENTE</Text>
        <Text style={styles.viewAllText}>Ver todo</Text>
      </View>

      {/* Activity Item 1 */}
      <TouchableOpacity 
        style={styles.activityCard}
        onPress={() => router.push('/service-summary' as any)}
        activeOpacity={0.8}
      >
        <View style={[styles.activityIndicator, { backgroundColor: '#10B981' }]} />
        <View style={styles.activityContent}>
          <View style={styles.activityTopRow}>
            <View style={styles.activityClientInfo}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarTextSmall}>JP</Text>
              </View>
              <View>
                <Text style={styles.activityClientName}>Juan Pérez</Text>
                <Text style={styles.activityTime}>Ayer • 2:30 PM</Text>
              </View>
            </View>
            <Text style={styles.activityAmountPositive}>+$428.00</Text>
          </View>
          <View style={styles.activityBottomRow}>
            <View style={styles.techBadgeCategory}>
              <Text style={styles.techBadgeCategoryText}>SOPORTE TÉCNICO</Text>
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Feather key={star} name="star" size={12} color="#D97706" />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Activity Item 2 */}
      <View style={styles.activityCard}>
        <View style={[styles.activityIndicator, { backgroundColor: '#EF4444' }]} />
        <View style={styles.activityContent}>
          <View style={styles.activityTopRow}>
            <View style={styles.activityClientInfo}>
              <View style={[styles.avatarSmall, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.avatarTextSmall, { color: '#64748B' }]}>MG</Text>
              </View>
              <View>
                <Text style={[styles.activityClientName, { color: '#64748B' }]}>Maria García</Text>
                <Text style={styles.activityTime}>12 Feb • 10:00 AM</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.activityOriginalAmount}>$650.00</Text>
              <Text style={styles.activityAmountNeutral}>+$50.00</Text>
            </View>
          </View>
          <View style={styles.activityBottomRow}>
            <View style={styles.cancelBadgeCategory}>
              <Text style={styles.cancelBadgeCategoryText}>CANCELADO</Text>
            </View>
            <Text style={styles.compensationText}>COMPENSACIÓN APLICADA</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );

  const renderEnCurso = () => {
    const activeReq = technicianRequests.find(r => ['ASIGNADA', 'EN_CAMINO', 'EN_PROCESO'].includes(r.estado));
    const activeId = activeReq ? String(activeReq.id_solicitud) : '';
    const clientName = activeReq ? `${activeReq.cliente_nombre || ''} ${activeReq.cliente_apellido || ''}`.trim() || 'Cliente' : 'Juan Pérez';
    const statusText = activeReq ? activeReq.estado.replace('_', ' ') : 'EN CAMINO';

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>SIGUIENTE DESTINO</Text>
          <Text style={styles.etaText}>ETA: 8 MIN</Text>
        </View>

        <TouchableOpacity 
          style={styles.activeServiceCard}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/tech-active-service', params: activeId ? { id: activeId } : undefined } as any)}
        >
          <View style={styles.activeServiceTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeClientName}>{clientName}</Text>
              <Text style={styles.activeClientAddress}>{activeReq?.direccion || 'COLONIA CENTRO • SOPORTE TÉCNICO'}</Text>
            </View>
            <View style={styles.avatarMedium}>
              <Text style={styles.avatarTextMedium}>{clientName.slice(0, 2).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.activeServiceMetaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>CITA</Text>
              <Text style={styles.metaValue}>{activeReq?.fecha_preferida || 'HOY'} • {activeReq?.hora_preferida || '12:30 PM'}</Text>
            </View>
            <View style={styles.metaDivider} />
            <TouchableOpacity 
              style={styles.metaBox}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/tech-active-service', params: activeId ? { id: activeId } : undefined } as any)}
            >
              <Text style={styles.metaLabel}>ESTATUS</Text>
              <Text style={[styles.metaValue, { color: '#FF6B1A', fontWeight: '800' }]}>{statusText}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activeServiceActions}>
            <TouchableOpacity 
              style={[styles.actionBtnNavegar, { flex: 1 }]}
              activeOpacity={0.8}
              onPress={() => {
                const lat = activeReq?.latitud != null ? Number(activeReq.latitud) : 17.9583;
                const lng = activeReq?.longitud != null ? Number(activeReq.longitud) : -102.2000;
                Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`).catch(() => {
                  Alert.alert('Error', 'No se pudo abrir la navegación de Google Maps.');
                });
              }}
            >
              <Feather name="navigation" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnNavegarText}>NAVEGAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtnDetalles, { flex: 1 }]}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/tech-active-service', params: activeId ? { id: activeId } : undefined } as any)}
            >
              <Feather name="file-text" size={14} color="#0F172A" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnDetallesText}>DETALLES</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>PROGRAMADO</Text>

        <View style={styles.scheduledCard}>
          <View style={styles.scheduledAvatar}>
            <Feather name="user" size={18} color="#FF6B1A" />
          </View>
          <View style={styles.scheduledInfo}>
            <Text style={styles.scheduledClient}>Maria García</Text>
            <Text style={styles.scheduledCategory}>PRIMER SECTOR • REPARACIÓN ELÉCTRICA</Text>
          </View>
          <View style={styles.scheduledTimeBox}>
            <Text style={styles.scheduledTime}>6:30 PM</Text>
            <Text style={styles.scheduledDay}>Mañana</Text>
          </View>
        </View>

      </ScrollView>
    );
  };

  const renderRequestQueue = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>SOLICITUDES DISPONIBLES</Text>
        <TouchableOpacity onPress={loadTechnicianRequests} activeOpacity={0.8}>
          <Feather name="refresh-cw" size={16} color="#FF6B1A" />
        </TouchableOpacity>
      </View>
      {requestsLoading ? (
        <ActivityIndicator size="large" color="#FF6B1A" style={{ marginTop: 30 }} />
      ) : technicianRequests.length === 0 ? (
        <Text style={styles.emptyRequests}>No hay solicitudes pendientes en este momento.</Text>
      ) : technicianRequests.map(request => {
        const isAssigned = ['ASIGNADA', 'EN_CAMINO', 'EN_PROCESO'].includes(request.estado);
        return (
          <TouchableOpacity 
            key={request.id_solicitud} 
            style={styles.queueCard}
            activeOpacity={isAssigned ? 0.8 : 1}
            onPress={() => {
              if (isAssigned) {
                router.push({ pathname: '/tech-active-service', params: { id: String(request.id_solicitud) } } as any);
              }
            }}
          >
            <View style={styles.queueHeader}>
              <View>
                <Text style={styles.queueFolio}>{request.folio}</Text>
                <Text style={styles.queueClient}>{request.cliente_nombre} {request.cliente_apellido}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (isAssigned) {
                    router.push({ pathname: '/tech-active-service', params: { id: String(request.id_solicitud) } } as any);
                  }
                }}
              >
                <View style={[styles.queueStatusBadge, isAssigned ? { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' } : { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                  <Text style={[styles.queueStatusText, isAssigned ? { color: '#4338CA' } : { color: '#D97706' }]}>
                    {request.estado.replace('_', ' ')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.queueCategoryBadge}>
              <Text style={styles.queueCategoryText}>{request.categoria || 'SERVICIO GENERAL'}</Text>
            </View>

            <Text style={styles.queueDescription} numberOfLines={3}>{request.descripcion}</Text>
            
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={13} color="#FF6B1A" />
              <Text style={styles.detailText}>{request.direccion}</Text>
            </View>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={13} color="#94A3B8" />
              <Text style={styles.detailText}>{request.fecha_preferida || 'Fecha abierta'} · {request.hora_preferida || 'Hora abierta'}</Text>
            </View>

            {request.estado === 'PENDIENTE' ? (
              <View style={styles.queueActions}>
                <TouchableOpacity 
                  style={styles.rejectPillButton} 
                  onPress={() => decideRequest(request, 'CANCELADA')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rejectPillText}>RECHAZAR</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  disabled={isPending}
                  style={[styles.acceptPillButton, isPending && { opacity: 0.6, backgroundColor: '#94A3B8' }]} 
                  onPress={() => isPending ? Alert.alert("En Revisión", "Tu cuenta de técnico se encuentra en revisión de documentos. No puedes aceptar o gestionar servicios hasta que tus credenciales sean aprobadas.") : decideRequest(request, 'ASIGNADA')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.acceptPillText}>ACEPTAR TRABAJO</Text>
                  <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 14, gap: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.actionBtnNavegar, { flex: 1 }]}
                    onPress={() => {
                      const lat = request?.latitud != null ? Number(request.latitud) : 17.9583;
                      const lng = request?.longitud != null ? Number(request.longitud) : -102.2000;
                      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`).catch(() => {
                        Alert.alert('Error', 'No se pudo abrir la navegación de Google Maps.');
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="navigation" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnNavegarText}>NAVEGAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnDetalles, { flex: 1.2 }]}
                    onPress={() => router.push({ pathname: '/tech-active-service', params: { id: String(request.id_solicitud) } } as any)}
                    activeOpacity={0.8}
                  >
                    <Feather name="file-text" size={14} color="#0F172A" style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnDetallesText}>DETALLES</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.actionBtnChatFull}
                  onPress={() => router.push({ pathname: '/tech-client-chat', params: { id: String(request.id_solicitud) } } as any)}
                  activeOpacity={0.8}
                >
                  <Feather name="message-circle" size={15} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnChatText}>CHAT</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Panel de Trabajo</Text>
          <Text style={styles.subtitleText}>TÉC. {user?.nombre ? `${user.nombre.toUpperCase()} ${user.apellido ? user.apellido.toUpperCase() : ''}` : 'ROBERTO G.'} • LÁZARO CÁRDENAS</Text>
        </View>
        <View style={styles.statusBadgePastel}>
          <View style={styles.statusDotGreen} />
          <Text style={styles.statusTextGreen}>ONLINE</Text>
        </View>
      </View>

      {isPending && (
        <View style={styles.reviewBanner}>
          <Feather name="clock" size={20} color="#D97706" style={{ marginRight: 10 }} />
          <Text style={styles.reviewBannerText}>
            Tu cuenta está en revisión. Tus documentos están siendo validados.
          </Text>
        </View>
      )}

      {/* Tabs con indicador Naranja */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'nuevas' && styles.activeTab]}
          onPress={() => setActiveTab('nuevas')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'nuevas' && styles.activeTabText]}>
            NUEVAS {activeTab !== 'nuevas' && '(3)'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'en_curso' && styles.activeTab]}
          onPress={() => setActiveTab('en_curso')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'en_curso' && styles.activeTabText]}>
            EN CURSO {activeTab !== 'en_curso' && '(2)'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'historial' && styles.activeTab]}
          onPress={() => setActiveTab('historial')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'historial' && styles.activeTabText]}>
            HISTORIAL
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentArea}>
        {activeTab === 'historial' && renderHistorial()}
        {activeTab === 'en_curso' && renderEnCurso()}
        {activeTab === 'nuevas' && renderRequestQueue()}
      </View>

      {/* Bottom Nav Flotante Blanco Sólido */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
          <View style={styles.activeNavDot} />
          <Feather name="package" size={22} color="#FF6B1A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
          <Feather name="users" size={22} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-profile' as any)} activeOpacity={0.8}>
          <Feather name="user" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 18, 
    paddingBottom: 15, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  subtitleText: { fontSize: 8, color: '#94A3B8', fontWeight: '800', letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },
  statusBadgePastel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 5 },
  statusTextGreen: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 1.2 },

  reviewBanner: { 
    backgroundColor: '#FFFBEB', 
    borderWidth: 1, 
    borderColor: '#FDE68A', 
    borderRadius: 14, 
    padding: 14, 
    marginHorizontal: 20, 
    marginTop: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  reviewBannerText: { flex: 1, fontSize: 12, color: '#B45309', fontWeight: '700', lineHeight: 18 },

  // Tabs
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#FF6B1A' },
  tabText: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2 },
  activeTabText: { color: '#FF6B1A' },

  contentArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 9, color: '#94A3B8', fontWeight: '800', letterSpacing: 1.5 },

  // Historial Tab
  trendBadgePastel: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  trendTextPastel: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  earningsAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  earningsAmount: { fontSize: 32, fontWeight: '800', color: '#0F172A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  earningsCurrency: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginLeft: 8 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    padding: 18, 
    marginRight: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  statLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0F172A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  viewAllText: { fontSize: 9, fontWeight: '800', color: '#FF6B1A', letterSpacing: 1 },
  
  /* Tarjetas Flotantes (#FFFFFF) */
  activityCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 14, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  activityIndicator: { width: 4, backgroundColor: '#FF6B1A' },
  activityContent: { flex: 1, padding: 18 },
  activityTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activityClientInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B1A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTextSmall: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  activityClientName: { fontSize: 14, color: '#0F172A', fontWeight: '700', marginBottom: 2 },
  activityTime: { fontSize: 9, color: '#94A3B8', letterSpacing: 0.5 },
  activityAmountPositive: { fontSize: 13, fontWeight: '800', color: '#059669' },
  activityOriginalAmount: { fontSize: 9, color: '#94A3B8', textDecorationLine: 'line-through', marginBottom: 2 },
  activityAmountNeutral: { fontSize: 13, fontWeight: '800', color: '#64748B' },
  activityBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  techBadgeCategory: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  techBadgeCategoryText: { fontSize: 8, fontWeight: '800', color: '#EA580C', letterSpacing: 0.5 },
  cancelBadgeCategory: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cancelBadgeCategoryText: { fontSize: 8, fontWeight: '800', color: '#DC2626', letterSpacing: 0.5 },
  starsRow: { flexDirection: 'row' },
  compensationText: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },

  // En Curso Tab
  etaText: { fontSize: 9, fontWeight: '800', color: '#059669', letterSpacing: 1 },
  activeServiceCard: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  activeServiceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  activeClientName: { fontSize: 18, color: '#0F172A', fontWeight: '800', marginBottom: 4 },
  activeClientAddress: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  avatarMedium: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B1A', justifyContent: 'center', alignItems: 'center' },
  avatarTextMedium: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  
  activeServiceMetaRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  metaBox: { flex: 1 },
  metaLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 4 },
  metaValue: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  metaDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 12 },
  
  activeServiceActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  chatPillButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFF7ED', 
    borderWidth: 1, 
    borderColor: '#FF6B1A', 
    height: 52, 
    minHeight: 52, 
    borderRadius: 14 
  },
  chatPillButtonText: { fontSize: 10, fontWeight: '800', color: '#FF6B1A', letterSpacing: 1 },
  mapPillButton: { 
    flex: 1.5, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FF6B1A', 
    height: 52, 
    minHeight: 52, 
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  mapPillButtonText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

  scheduledCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  scheduledAvatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: '#FFEDD5' },
  scheduledInfo: { flex: 1 },
  scheduledClient: { fontSize: 14, color: '#0F172A', fontWeight: '700', marginBottom: 2 },
  scheduledCategory: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  scheduledTimeBox: { alignItems: 'flex-end' },
  scheduledTime: { fontSize: 11, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  scheduledDay: { fontSize: 9, color: '#94A3B8', fontWeight: '600' },

  // Queue Card
  emptyRequests: { color: '#94A3B8', textAlign: 'center', paddingVertical: 45, fontWeight: '600' },
  queueCard: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  queueFolio: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  queueClient: { color: '#64748B', fontSize: 12, marginTop: 2, fontWeight: '600' },
  queueStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  queueStatusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  
  queueCategoryBadge: { alignSelf: 'flex-start', backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  queueCategoryText: { color: '#EA580C', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  
  queueDescription: { color: '#475569', fontSize: 13, lineHeight: 19, marginBottom: 12, fontWeight: '500' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { color: '#64748B', fontSize: 11, marginLeft: 6, fontWeight: '500' },
  
  queueActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectPillButton: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#FCA5A5', 
    backgroundColor: '#FEF2F2', 
    height: 52, 
    minHeight: 52, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  rejectPillText: { color: '#EF4444', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  acceptPillButton: { 
    flex: 1.5, 
    flexDirection: 'row', 
    backgroundColor: '#FF6B1A', 
    height: 52, 
    minHeight: 52, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  acceptPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  pillButtonPrimary: {
    backgroundColor: '#FF6B1A',
    height: 52,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pillButtonPrimaryText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  pillButtonOutline: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FF6B1A',
    height: 52,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pillButtonOutlineText: { color: '#FF6B1A', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  /* Botones Independientes del Panel de Trabajo */
  actionBtnNavegar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B1A',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnNavegarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionBtnDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionBtnDetallesText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionBtnChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionBtnChatText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionBtnChatFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    width: '100%',
  },

  // Bottom Nav
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    height: 70, 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    paddingBottom: Platform.OS === 'ios' ? 15 : 0, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10 
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10, position: 'relative' },
  activeNavDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6B1A', position: 'absolute', top: 4 }
});
