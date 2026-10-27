import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { theme } from './theme';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getClientRequests, ServiceRequest } from '../services/requestsApi';


export default function ClientDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [clientRequests, setClientRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const isClient = user?.id_rol === 1 || user?.perfil === 'cliente' || user?.rol === 'cliente' || (!user?.id_rol && user?.perfil !== 'tecnico');

  const loadClientRequests = useCallback(async () => {
    if (!isClient) return;
    setLoadingRequests(true);
    try {
      const data = await getClientRequests();
      setClientRequests(data);
    } catch (err: any) {
      console.log('Error al cargar solicitudes de cliente:', err?.message || err);
    } finally {
      setLoadingRequests(false);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      loadClientRequests();
    }
  }, [isClient, loadClientRequests]);

  const userEmail = String(user?.correo || user?.email || '').trim().toLowerCase();
  const isMasterUser = ['jesusabar123@gmail.com', 'jesusabar123123@gmail.com', 'luisgallo123123@gmail.com'].includes(userEmail);
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

  const openServices = (params: { category?: string; search?: string } = {}) => {
    if (isPending) {
      Alert.alert(
        "En Revisión",
        "Tus documentos están siendo validados."
      );
      return;
    }
    if (params.category) {
      router.push({ pathname: '/confirm-service', params } as any);
    } else {
      router.push({ pathname: '/service-list', params } as any);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B1A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Contenido principal scrolleable */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header: Brand y Perfil */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Feather name="zap" size={16} color={theme.primary} />
            </View>
            <View>
              <Text style={styles.brandTitle}>Click & Serve</Text>
              <Text style={styles.locationText}>LÁZARO CÁRDENAS</Text>
            </View>
          </View>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.avatarButton} 
            onPress={() => router.push('/client-profile' as any)}
          >
            <Feather name="user" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {isPending && (
          <View style={styles.reviewBanner}>
            <Feather name="clock" size={20} color="#D97706" style={{ marginRight: 10 }} />
            <Text style={styles.reviewBannerText}>
              Tu cuenta está en revisión. Tus documentos están siendo validados.
            </Text>
          </View>
        )}

        {/* Imagen Ilustración Banner */}
        <View style={styles.heroImageContainer}>
          <Image
            source={require('../assets/fondo.jpeg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Saludo Principal */}
        <Text style={styles.greetingText}>
          ¿Qué solución{'\n'}buscas hoy?
        </Text>

        {/* Tarjeta de Servicio Activo del Cliente (si existe) */}
        {(() => {
          const activeService = clientRequests.find(r => ['ASIGNADA', 'EN_CAMINO', 'EN_PROCESO', 'ESPERANDO_APROBACION'].includes(r.estado));
          if (!activeService) return null;

          const techLat = (activeService as any)?.tecnico_latitud || (activeService as any)?.latitud || 17.9583;
          const techLng = (activeService as any)?.tecnico_longitud || (activeService as any)?.longitud || -102.2000;
          const techName = activeService.tecnico_nombre
            ? `${activeService.tecnico_nombre} ${activeService.tecnico_apellido || ''}`.trim()
            : 'Técnico asignado';

          return (
            <View style={styles.activeServiceCard}>
              <View style={styles.activeServiceHeader}>
                <View>
                  <Text style={styles.activeServiceBadgeTitle}>SERVICIO EN CURSO</Text>
                  <Text style={styles.activeServiceFolio}>#{activeService.folio || 'SRV'}</Text>
                </View>
                <View style={styles.activeServiceStatusPill}>
                  <View style={styles.activeServiceDot} />
                  <Text style={styles.activeServiceStatusText}>{activeService.estado.replace('_', ' ')}</Text>
                </View>
              </View>

              <Text style={styles.activeServiceTechName}>{techName}</Text>
              <Text style={styles.activeServiceCategory}>{activeService.categoria || 'SOPORTE TÉCNICO'}</Text>
              <Text style={styles.activeServiceAddress} numberOfLines={1}>{activeService.direccion || 'Ubicación registrada'}</Text>

              <View style={styles.activeServiceButtonsRow}>
                <TouchableOpacity
                  style={styles.btnVerMapa}
                  activeOpacity={0.8}
                  onPress={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${techLat},${techLng}`;
                    Linking.openURL(url).catch(() => {
                      Alert.alert('Error', 'No se pudo abrir Google Maps.');
                    });
                  }}
                >
                  <Feather name="navigation" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.btnVerMapaText}>VER MAPA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnDetalles}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/order-status', params: { id: String(activeService.id_solicitud) } } as any)}
                >
                  <Feather name="file-text" size={14} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.btnDetallesText}>DETALLES</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnChat}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/tech-client-chat', params: { id: String(activeService.id_solicitud) } } as any)}
                >
                  <Feather name="message-circle" size={14} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.btnChatText}>CHAT</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}

        {/* Alerta / Banner Promocional Flotante */}
        <View style={styles.promoBanner}>
          <View style={styles.promoIconContainer}>
            <Feather name="bell" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>TÉCNICOS VERIFICADOS EN TU ZONA</Text>
            <Text style={styles.promoSubtitle}>Respuesta rápida y soporte garantizado en minutos.</Text>
          </View>
        </View>

        {/* Barra de Búsqueda Flotante con Botón Tipo Pastilla */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ej. Refrigeración, Herrería, Electricidad..."
            placeholderTextColor="#94A3B8"
            selectionColor={theme.primary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => isPending ? Alert.alert("En Revisión", "Tus documentos están siendo validados.") : openServices({ search: search.trim() || undefined })}
            returnKeyType="search"
          />
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.searchButtonPill, isPending && { opacity: 0.6, backgroundColor: '#CBD5E1' }]}
            onPress={() => isPending ? Alert.alert("En Revisión", "Tus documentos están siendo validados.") : openServices({ search: search.trim() || undefined })}
            accessibilityLabel="Buscar servicios"
          >
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Sección de Categorías */}
        <Text style={styles.sectionTitle}>EXPLORAR CATEGORÍAS</Text>
        
        <View style={styles.gridContainer}>
          {/* Tarjeta TECH */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.categoryCard, isPending && { opacity: 0.6 }]} 
            onPress={() => isPending ? Alert.alert("En Revisión", "Tus documentos están siendo validados.") : openServices({ category: 'TECH' })}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }]}>
              <Feather name="monitor" size={26} color="#2563EB" />
            </View>
            <Text style={styles.categoryText}>TECH</Text>
            <Text style={styles.categorySubtext}>Soporte & Redes</Text>
          </TouchableOpacity>

          {/* Tarjeta LUZ */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.categoryCard, isPending && { opacity: 0.6 }]} 
            onPress={() => isPending ? Alert.alert("En Revisión", "Tus documentos están siendo validados.") : openServices({ category: 'LUZ' })}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1 }]}>
              <Feather name="zap" size={26} color="#D97706" />
            </View>
            <Text style={styles.categoryText}>LUZ</Text>
            <Text style={styles.categorySubtext}>Instalaciones & Eléctrico</Text>
          </TouchableOpacity>

          {/* Tarjeta HOGAR */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.categoryCard, isPending && { opacity: 0.6 }]} 
            onPress={() => isPending ? Alert.alert("En Revisión", "Tus documentos están siendo validados.") : openServices({ category: 'HOGAR' })}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1 }]}>
              <Feather name="home" size={26} color="#059669" />
            </View>
            <Text style={styles.categoryText}>HOGAR</Text>
            <Text style={styles.categorySubtext}>Plomería & Mantenimiento</Text>
          </TouchableOpacity>

          {/* Tarjeta OTROS */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.categoryCard, isPending && { opacity: 0.6 }]} 
            onPress={() => isPending ? Alert.alert("En Revisión", "Tus documentos están siendo validados.") : openServices({ category: 'OTROS' })}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF', borderWidth: 1 }]}>
              <Feather name="sliders" size={26} color="#7C3AED" />
            </View>
            <Text style={styles.categoryText}>OTROS</Text>
            <Text style={styles.categorySubtext}>Servicios Especiales</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Navegación Inferior Flotante Blanco Sólido */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
          <View style={styles.activeNavDot} />
          <Feather name="home" size={22} color="#FF6B1A" />
        </TouchableOpacity> 
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-requests' as any)} activeOpacity={0.8}>
          <Feather name="clock" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 100 },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 18,
    paddingVertical: 4
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  locationText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 1,
  },
  avatarButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  
  reviewBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
    lineHeight: 18,
  },

  /* Tarjeta de Servicio Activo en Dashboard */
  activeServiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  activeServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  activeServiceBadgeTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF6B1A',
    letterSpacing: 1.2,
  },
  activeServiceFolio: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  activeServiceStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeServiceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  activeServiceStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  activeServiceTechName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  activeServiceCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  activeServiceAddress: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 14,
  },
  activeServiceButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnVerMapa: {
    flex: 1.3,
    flexDirection: 'row',
    backgroundColor: '#FF6B1A',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnVerMapaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  btnDetalles: {
    flex: 1.1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDetallesText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  btnChat: {
    flex: 0.9,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnChatText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  /* Hero Image Banner */
  heroImageContainer: { 
    width: '100%', 
    height: 140, 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 20, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  heroImage: { width: '100%', height: '100%' },

  greetingText: {
    fontSize: 30,
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 36,
    fontWeight: '700',
  },

  /* Banner Promocional Flotante */
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  promoIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  promoTitle: { fontSize: 9, fontWeight: '800', color: '#FF6B1A', letterSpacing: 1.2, marginBottom: 2 },
  promoSubtitle: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  /* Barra de Búsqueda Flotante */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingLeft: 18,
    paddingRight: 6,
    height: 54,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '600' },
  searchButtonPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF6B1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  
  /* Grid de Tarjetas Flotantes */
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: { fontSize: 13, fontWeight: '800', color: '#0F172A', letterSpacing: 1.2, marginBottom: 2 },
  categorySubtext: { fontSize: 10, color: '#64748B', textAlign: 'center', fontWeight: '600' },
  
  /* Bottom Nav */
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
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10, position: 'relative' },
  activeNavDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6B1A', position: 'absolute', top: 4 },
});
