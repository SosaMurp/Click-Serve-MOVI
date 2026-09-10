import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MyRequests() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    if (params.showSuccess === 'true') {
      setSuccessModalVisible(true);
    }
  }, [params]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Solicitudes</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Feather name="bell" size={20} color="#7A8C9E" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* IN CURSO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EN CURSO</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>1</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.activeCard}>
          <View style={styles.activeCardIndicator} />
          <View style={styles.activeCardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Feather name="monitor" size={16} color="#0A192F" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.cardCategory}>SOPORTE TÉCNICO</Text>
                  <Text style={styles.cardTime}>Hace 10 min</Text>
                </View>
              </View>
              <View style={styles.statusBadgeWaiting}>
                <View style={styles.statusDotWaiting} />
                <Text style={styles.statusTextWaiting}>EN ESPERA</Text>
              </View>
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>
              "Mi PC no enciende tras una descarga eléctrica ayer en la noche..."
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.techInfo}>
                <View style={styles.techAvatar} />
                <Text style={styles.techName}>Téc. Roberto G.</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#D1D9E0" />
            </View>
          </View>
        </TouchableOpacity>

        {/* HISTORIAL PASADO */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>HISTORIAL PASADO</Text>

        <View style={styles.historyList}>
          {/* History Item 1 */}
          <TouchableOpacity style={styles.historyItem}>
            <View style={styles.historyItemHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="zap" size={12} color="#9CA8B6" style={{ marginRight: 6 }} />
                <Text style={styles.historyCategory}>ELECTRICIDAD</Text>
              </View>
              <Text style={styles.historyStatusText}>FINALIZADO - 24 ENE</Text>
            </View>
            <Text style={styles.historyDescription} numberOfLines={1}>
              "Cambio de cableado en la cocina..."
            </Text>
            <Text style={styles.historyRating}>★ 5.0  CALIFICACIÓN PRIVADA</Text>
          </TouchableOpacity>

          {/* History Item 2 */}
          <TouchableOpacity style={styles.historyItem}>
            <View style={styles.historyItemHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="tool" size={12} color="#9CA8B6" style={{ marginRight: 6 }} />
                <Text style={styles.historyCategory}>PLOMERÍA</Text>
              </View>
              <Text style={[styles.historyStatusText, { color: '#FF6B6B' }]}>CANCELADO</Text>
            </View>
            <Text style={styles.historyDescription} numberOfLines={1}>
              "Fuga de agua en baño principal..."
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Mock Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/client-dashboard')}>
          <Feather name="home" size={24} color="#C4CDD5" />
        </TouchableOpacity> 
        <TouchableOpacity style={styles.navItem}>
          <Feather name="clock" size={24} color="#0A192F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/client-profile')}>
          <Feather name="user" size={24} color="#C4CDD5" />
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            
            <View style={styles.successIconWrapper}>
              <Feather name="check" size={24} color="#0A192F" />
            </View>

            <Text style={styles.successTitle}>¡Solicitud Enviada!</Text>
            <Text style={styles.successSubtitle}>
              EL TÉCNICO HA RECIBIDO TU PETICIÓN.{'\n'}TE NOTIFICAREMOS CUANDO ACEPTE.
            </Text>

            <TouchableOpacity 
              style={styles.successButton} 
              onPress={() => {
                setSuccessModalVisible(false);
                router.setParams({ showSuccess: '' });
              }}
            >
              <Text style={styles.successButtonText}>VER MIS SOLICITUDES</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  bellButton: { position: 'relative', padding: 5 },
  notificationDot: { position: 'absolute', top: 5, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B', borderWidth: 1.5, borderColor: '#FFFFFF' },
  
  scrollContainer: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 100 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  countBadge: { backgroundColor: '#0A192F', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  
  activeCard: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#F0F4F8', flexDirection: 'row', overflow: 'hidden', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activeCardIndicator: { width: 4, backgroundColor: '#0A192F' },
  activeCardContent: { flex: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  cardCategory: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  cardTime: { fontSize: 9, color: '#9CA8B6', marginTop: 2 },
  statusBadgeWaiting: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#FFEDD5' },
  statusDotWaiting: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316', marginRight: 4 },
  statusTextWaiting: { fontSize: 8, fontWeight: '800', color: '#F97316', letterSpacing: 1 },
  cardDescription: { fontSize: 13, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 20, marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F4F8', paddingTop: 15 },
  techInfo: { flexDirection: 'row', alignItems: 'center' },
  techAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E1E8ED', marginRight: 8 },
  techName: { fontSize: 10, fontWeight: '800', color: '#0A192F' },
  
  historyList: { marginTop: 10 },
  historyItem: { borderBottomWidth: 1, borderBottomColor: '#F0F4F8', paddingVertical: 20 },
  historyItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyCategory: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },
  historyStatusText: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },
  historyDescription: { fontSize: 12, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 8 },
  historyRating: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(240, 244, 248, 0.85)', justifyContent: 'center', alignItems: 'center' }, // Blur-like effect
  successModalContent: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 30, alignItems: 'center', shadowColor: '#0A192F', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 15 },
  successIconWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 15 },
  successSubtitle: { fontSize: 8, color: '#0A192F', fontWeight: '800', letterSpacing: 1.5, textAlign: 'center', lineHeight: 14, marginBottom: 30 },
  successButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, width: '100%', alignItems: 'center' },
  successButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
