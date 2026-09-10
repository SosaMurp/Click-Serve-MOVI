import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  ImageBackground
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function TechDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('historial'); // 'nuevas', 'en_curso', 'historial'

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const renderHistorial = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>GANANCIAS SEMANALES</Text>
        <View style={styles.trendBadge}>
          <Text style={styles.trendText}>+12% vs semana anterior</Text>
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
      >
        <View style={styles.activityIndicator} />
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
            <Text style={styles.activityCategory}>SOPORTE TÉCNICO</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Feather key={star} name="star" size={10} color="#0A192F" />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Activity Item 2 */}
      <View style={styles.activityCard}>
        <View style={[styles.activityIndicator, { backgroundColor: '#FF6B6B' }]} />
        <View style={styles.activityContent}>
          <View style={styles.activityTopRow}>
            <View style={styles.activityClientInfo}>
              <View style={[styles.avatarSmall, { backgroundColor: '#F8FAFC' }]}>
                <Text style={[styles.avatarTextSmall, { color: '#9CA8B6' }]}>MG</Text>
              </View>
              <View>
                <Text style={[styles.activityClientName, { color: '#9CA8B6' }]}>Maria García</Text>
                <Text style={styles.activityTime}>12 Feb • 10:00 AM</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.activityOriginalAmount}>$650.00</Text>
              <Text style={styles.activityAmountNeutral}>+$50.00</Text>
            </View>
          </View>
          <View style={styles.activityBottomRow}>
            <Text style={[styles.activityCategory, { color: '#FF6B6B' }]}>SERVICIO CANCELADO</Text>
            <Text style={styles.compensationText}>COMPENSACIÓN APLICADA</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );

  const renderEnCurso = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>SIGUIENTE DESTINO</Text>
        <Text style={styles.etaText}>ETA: 8 MIN</Text>
      </View>

      <View style={styles.activeServiceCard}>
        <View style={styles.activeServiceTopRow}>
          <View>
            <Text style={styles.activeClientName}>Juan Pérez</Text>
            <Text style={styles.activeClientAddress}>COLONIA CENTRO • SOPORTE TÉCNICO</Text>
          </View>
          <View style={styles.avatarMedium}>
            <Text style={styles.avatarTextSmall}>JP</Text>
          </View>
        </View>

        <View style={styles.activeServiceMetaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>CITA</Text>
            <Text style={styles.metaValue}>HOY • 12:30 PM</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>ESTATUS</Text>
            <Text style={styles.metaValue}>EN CAMINO</Text>
          </View>
        </View>

        <View style={styles.activeServiceActions}>
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/tech-client-chat' as any)}>
            <Feather name="message-circle" size={14} color="#7A8C9E" style={{ marginRight: 8 }} />
            <Text style={styles.chatButtonText}>CHAT</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => router.push('/tech-active-service' as any)}
          >
            <Feather name="map-pin" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.mapButtonText}>VER EN MAPA</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 15 }]}>PROGRAMADO</Text>

      <View style={styles.scheduledCard}>
        <View style={styles.scheduledAvatar}>
          <Feather name="user" size={16} color="#D1D9E0" />
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

  const renderNuevas = () => (
    <View style={styles.mapTabContainer}>
      <View style={styles.mapPlaceholder}>
        <View style={styles.availableBadge}>
          <View style={styles.availableDot} />
          <Text style={styles.availableText}>3 DISPONIBLES</Text>
        </View>
        
        {/* Decorative Map Elements */}
        <View style={styles.mapPinFar}>
          <View style={styles.mapPinInnerFar} />
        </View>
        <View style={styles.mapPinNear}>
          <View style={styles.mapPinInnerNear} />
          <View style={styles.mapPinLabel}>
            <Text style={styles.mapPinLabelText}>A 1.2 KM</Text>
          </View>
        </View>
      </View>

      <View style={styles.newRequestCard}>
        <View style={styles.newRequestHeader}>
          <Text style={styles.newRequestCategory}>SOPORTE TÉCNICO</Text>
          <Feather name="x" size={16} color="#C4CDD5" />
        </View>

        <View style={styles.newRequestClientRow}>
          <View>
            <Text style={styles.newRequestClientName}>Mariana L.</Text>
            <Text style={styles.newRequestAddress}>LAS AMÉRICAS • A 1.2 KM</Text>
          </View>
          <View style={[styles.avatarMedium, { backgroundColor: '#7A8C9E' }]}>
            <Text style={styles.avatarTextSmall}>ML</Text>
          </View>
        </View>

        <View style={styles.newRequestNoteBox}>
          <Text style={styles.newRequestNoteLabel}>DESCRIPCIÓN DE LA FALLA</Text>
          <Text style={styles.newRequestNoteText}>
            "Mi laptop arrojó una pantalla azul de repente y no pasa de ahí. Necesito rescatar unos archivos urgentes para la universidad."
          </Text>
        </View>

        <View style={styles.newRequestMetaRow}>
          <View style={styles.newRequestMetaItem}>
            <Feather name="calendar" size={14} color="#9CA8B6" style={{ marginRight: 8 }} />
            <Text style={styles.newRequestMetaText}>HOY</Text>
          </View>
          <View style={styles.newRequestMetaDivider} />
          <View style={styles.newRequestMetaItem}>
            <Feather name="clock" size={14} color="#9CA8B6" style={{ marginRight: 8 }} />
            <Text style={[styles.newRequestMetaText, { textTransform: 'none' }]}>Lo antes posible</Text>
          </View>
        </View>

        <View style={styles.newRequestActions}>
          <TouchableOpacity style={styles.hideButton}>
            <Text style={styles.hideButtonText}>OCULTAR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptNewButton}
            onPress={() => setActiveTab('en_curso')}
          >
            <Text style={styles.acceptNewButtonText}>ACEPTAR TRABAJO</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Panel de Trabajo</Text>
          <Text style={styles.subtitleText}>TÉC. ROBERTO G. • LÁZARO CÁRDENAS</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ONLINE</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'nuevas' && styles.activeTab]}
          onPress={() => setActiveTab('nuevas')}
        >
          <Text style={[styles.tabText, activeTab === 'nuevas' && styles.activeTabText]}>
            NUEVAS {activeTab !== 'nuevas' && '(3)'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'en_curso' && styles.activeTab]}
          onPress={() => setActiveTab('en_curso')}
        >
          <Text style={[styles.tabText, activeTab === 'en_curso' && styles.activeTabText]}>
            EN CURSO {activeTab !== 'en_curso' && '(2)'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'historial' && styles.activeTab]}
          onPress={() => setActiveTab('historial')}
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
        {activeTab === 'nuevas' && renderNuevas()}
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="package" size={24} color="#0A192F" />
          <View style={styles.activeNavDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="users" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-profile' as any)}>
          <Feather name="user" size={24} color="#C4CDD5" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFFFFF' },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  subtitleText: { fontSize: 8, color: '#7A8C9E', fontWeight: '800', letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  statusText: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },

  // Tabs
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0A192F' },
  tabText: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },
  activeTabText: { color: '#0A192F' },

  contentArea: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 100 },
  
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 9, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1.5 },

  // Historial Tab
  trendBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  trendText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1 },
  earningsAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 25 },
  earningsAmount: { fontSize: 32, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  earningsCurrency: { fontSize: 10, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1, marginLeft: 8 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginRight: 10 },
  statLabel: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  viewAllText: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  
  activityCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, overflow: 'hidden', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  activityIndicator: { width: 4, backgroundColor: '#0A192F' },
  activityContent: { flex: 1, padding: 20 },
  activityTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  activityClientInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTextSmall: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  activityClientName: { fontSize: 14, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  activityTime: { fontSize: 8, color: '#9CA8B6', letterSpacing: 1 },
  activityAmountPositive: { fontSize: 12, fontWeight: '800', color: '#10B981' },
  activityOriginalAmount: { fontSize: 8, color: '#9CA8B6', textDecorationLine: 'line-through', marginBottom: 2 },
  activityAmountNeutral: { fontSize: 12, fontWeight: '800', color: '#7A8C9E' },
  
  activityBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityCategory: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  starsRow: { flexDirection: 'row' },
  compensationText: { fontSize: 7, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },

  // En Curso Tab
  etaText: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  activeServiceCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#0A192F', borderRadius: 8, padding: 25, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  activeServiceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  activeClientName: { fontSize: 18, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  activeClientAddress: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  avatarMedium: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center' },
  
  activeServiceMetaRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 4, padding: 15, marginBottom: 20 },
  metaBox: { flex: 1 },
  metaLabel: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 6 },
  metaValue: { fontSize: 10, fontWeight: '800', color: '#0A192F' },
  metaDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 15 },
  
  activeServiceActions: { flexDirection: 'row', justifyContent: 'space-between' },
  chatButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 14, borderRadius: 4, marginRight: 15 },
  chatButtonText: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  mapButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A192F', paddingVertical: 14, borderRadius: 4 },
  mapButtonText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },

  scheduledCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20 },
  scheduledAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F0F4F8' },
  scheduledInfo: { flex: 1 },
  scheduledClient: { fontSize: 14, color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  scheduledCategory: { fontSize: 7, fontWeight: '800', color: '#C4CDD5', letterSpacing: 1.5 },
  scheduledTimeBox: { alignItems: 'flex-end' },
  scheduledTime: { fontSize: 10, fontWeight: '800', color: '#7A8C9E', marginBottom: 4 },
  scheduledDay: { fontSize: 8, color: '#C4CDD5', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  // Nuevas Tab (Map)
  mapTabContainer: { flex: 1, position: 'relative' },
  mapPlaceholder: { flex: 1, backgroundColor: '#E2E8F0', opacity: 0.8 },
  availableBadge: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  availableDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  availableText: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  
  mapPinFar: { position: 'absolute', top: '30%', left: '20%', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(122, 140, 158, 0.2)', justifyContent: 'center', alignItems: 'center' },
  mapPinInnerFar: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#7A8C9E' },
  mapPinNear: { position: 'absolute', top: '45%', left: '50%', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(10, 25, 47, 0.2)', justifyContent: 'center', alignItems: 'center' },
  mapPinInnerNear: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#0A192F', borderWidth: 2, borderColor: '#FFFFFF' },
  mapPinLabel: { position: 'absolute', top: 35, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  mapPinLabelText: { fontSize: 7, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },

  newRequestCard: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  newRequestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  newRequestCategory: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  newRequestClientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  newRequestClientName: { fontSize: 18, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  newRequestAddress: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  
  newRequestNoteBox: { borderLeftWidth: 2, borderLeftColor: '#0A192F', paddingLeft: 15, marginBottom: 20 },
  newRequestNoteLabel: { fontSize: 7, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 8 },
  newRequestNoteText: { fontSize: 12, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 20 },
  
  newRequestMetaRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 4, padding: 12, marginBottom: 25 },
  newRequestMetaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  newRequestMetaText: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  newRequestMetaDivider: { width: 1, backgroundColor: '#E2E8F0' },
  
  newRequestActions: { flexDirection: 'row', justifyContent: 'space-between' },
  hideButton: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 16, borderRadius: 4, marginRight: 15, alignItems: 'center', justifyContent: 'center' },
  hideButtonText: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  acceptNewButton: { flex: 1.5, flexDirection: 'row', backgroundColor: '#0A192F', paddingVertical: 16, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  acceptNewButtonText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },

  // Navegación Inferior
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 20 : 0, zIndex: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  activeNavDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0A192F', marginTop: 4 }
});