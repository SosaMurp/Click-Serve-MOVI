import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';

export default function ChooseTech() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTech, setSelectedTech] = useState<any>(null);

  const openTechModal = (tech: any) => {
    setSelectedTech(tech);
    setModalVisible(true);
  };

  const handleSelect = () => {
    setModalVisible(false);
    // Navigate to requests page passing a parameter to show the success modal
    router.push({ pathname: '/my-requests', params: { showSuccess: 'true' } } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Elegir Técnico</Text>
          <Text style={styles.headerSubtitle}>LÁZARO CÁRDENAS - PASO 2 DE 2</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Opción Rápida */}
        <TouchableOpacity 
          style={styles.quickOptionCard}
          onPress={() => router.push('/search-tech' as any)}
        >
          <View>
            <Text style={styles.quickOptionTitle}>OPCIÓN RÁPIDA</Text>
            <Text style={styles.quickOptionSubtitle}>Búsqueda automática</Text>
          </View>
          <Feather name="radio" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.quickOptionHint}>Cualquier técnico disponible podrá tomar tu solicitud inmediatamente.</Text>

        {/* Favoritos */}
        <Text style={styles.sectionTitle}>TUS FAVORITOS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {[
            { id: 1, name: 'Ing. Marcos', rating: '5.0' },
            { id: 2, name: 'Luis T.', rating: '4.8' }
          ].map((tech) => (
            <TouchableOpacity key={tech.id} style={styles.favoriteItem} onPress={() => openTechModal(tech)}>
              <View style={styles.favoriteAvatarWrapper}>
                <View style={styles.favoriteAvatar} />
              </View>
              <Text style={styles.favoriteName}>{tech.name}</Text>
              <Text style={styles.favoriteRating}>★ {tech.rating}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Destacados */}
        <Text style={styles.sectionTitle}>TÉCNICOS DESTACADOS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {[
            { id: 3, name: 'Roberto G.', role: 'HARDWARE EXPERTO', badge: 'PRO' },
            { id: 4, name: 'Alicia Mejía', role: 'REDES & CCTV', badge: 'TOP' }
          ].map((tech) => (
            <TouchableOpacity key={tech.id} style={styles.featuredCard} onPress={() => openTechModal(tech)}>
              <View style={styles.featuredHeader}>
                <View style={styles.featuredAvatar} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tech.badge}</Text>
                </View>
              </View>
              <Text style={styles.featuredName}>{tech.name}</Text>
              <Text style={styles.featuredRole}>{tech.role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Otros */}
        <Text style={styles.sectionTitle}>OTROS TÉCNICOS DISPONIBLES</Text>
        <View style={styles.othersContainer}>
          {[
            { id: 5, initials: 'CP', name: 'Carlos P.', role: 'TÉCNICO GENERAL', rating: '4.9', reviews: '128 serv.' },
            { id: 6, initials: 'EM', name: 'Eduardo M.', role: 'ELECTRICIDAD INDUSTRIAL', rating: '4.7', reviews: '95 serv.' }
          ].map((tech) => (
            <TouchableOpacity key={tech.id} style={styles.otherItem} onPress={() => openTechModal(tech)}>
              <View style={styles.otherAvatar}>
                <Text style={styles.otherAvatarText}>{tech.initials}</Text>
              </View>
              <View style={styles.otherInfo}>
                <Text style={styles.otherName}>{tech.name}</Text>
                <Text style={styles.otherRole}>{tech.role}</Text>
              </View>
              <View style={styles.otherStats}>
                <Text style={styles.otherRating}>★ {tech.rating}</Text>
                <Text style={styles.otherReviews}>{tech.reviews}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Tech Profile Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Feather name="x" size={20} color="#9CA8B6" />
            </TouchableOpacity>

            <View style={styles.modalAvatarContainer}>
              <View style={styles.modalAvatar} />
              <View style={styles.modalCheckBadge}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.modalName}>{selectedTech?.name || 'Ing. Eduardo M.'}</Text>
            <Text style={styles.modalRole}>{selectedTech?.role || 'ELECTRICIDAD INDUSTRIAL'}</Text>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatValue}>4.9</Text>
                <Text style={styles.modalStatLabel}>CALIF.</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatValue}>142</Text>
                <Text style={styles.modalStatLabel}>SERVICIOS</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatValue}>3a</Text>
                <Text style={styles.modalStatLabel}>EXP.</Text>
              </View>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>ÚLTIMA RESEÑA</Text>
              <Text style={styles.reviewQuote}>
                "Eduardo salvó mi instalación. Llegó en 10 minutos, traía todas las refacciones y fue súper limpio."
              </Text>
              <Text style={styles.reviewAuthor}>- MARIANA R.</Text>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>CERRAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSelectBtn} onPress={handleSelect}>
                <Text style={styles.modalSelectBtnText}>SELECCIONAR</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  
  quickOptionCard: { flexDirection: 'row', backgroundColor: '#0A192F', padding: 25, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  quickOptionTitle: { fontSize: 9, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
  quickOptionSubtitle: { fontSize: 18, color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  quickOptionHint: { fontSize: 9, color: '#9CA8B6', textAlign: 'center', marginBottom: 35 },
  
  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 15 },
  horizontalScroll: { paddingBottom: 30 },
  
  favoriteItem: { alignItems: 'center', marginRight: 25 },
  favoriteAvatarWrapper: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, borderColor: '#D1D9E0', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  favoriteAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E1E8ED' },
  favoriteName: { fontSize: 12, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  favoriteRating: { fontSize: 10, color: '#7A8C9E', fontWeight: '700' },
  
  featuredCard: { width: 180, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#F0F4F8', padding: 15, marginRight: 15 },
  featuredHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  featuredAvatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#E1E8ED' },
  badge: { backgroundColor: '#0A192F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 8, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  featuredName: { fontSize: 12, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  featuredRole: { fontSize: 9, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1 },
  
  othersContainer: { marginBottom: 20 },
  otherItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  otherAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  otherAvatarText: { fontSize: 14, fontWeight: '800', color: '#9CA8B6' },
  otherInfo: { flex: 1 },
  otherName: { fontSize: 14, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  otherRole: { fontSize: 9, color: '#7A8C9E', fontWeight: '800', letterSpacing: 1 },
  otherStats: { alignItems: 'flex-end' },
  otherRating: { fontSize: 11, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  otherReviews: { fontSize: 9, color: '#9CA8B6' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalCloseButton: { position: 'absolute', top: 15, right: 15, padding: 5 },
  modalAvatarContainer: { alignSelf: 'center', marginBottom: 20, marginTop: 10, position: 'relative' },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E1E8ED', borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5 },
  modalCheckBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0A192F', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  modalName: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', marginBottom: 5 },
  modalRole: { fontSize: 9, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1.5, textAlign: 'center', marginBottom: 25 },
  
  modalStatsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  modalStatItem: { alignItems: 'center', paddingHorizontal: 15 },
  modalStatValue: { fontSize: 16, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  modalStatLabel: { fontSize: 8, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1 },
  modalStatDivider: { width: 1, backgroundColor: '#F0F4F8' },

  reviewCard: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 20, marginBottom: 30 },
  reviewTitle: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 10 },
  reviewQuote: { fontSize: 12, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 18, marginBottom: 10 },
  reviewAuthor: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1, textAlign: 'right' },

  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancelBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, marginRight: 10 },
  modalCancelBtnText: { fontSize: 10, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  modalSelectBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: '#0A192F', borderRadius: 4 },
  modalSelectBtnText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
});
