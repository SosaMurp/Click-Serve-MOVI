import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechSupport() {
  const router = useRouter();

  const FAQItem = ({ title }: { title: string }) => (
    <TouchableOpacity style={styles.faqItem}>
      <Text style={styles.faqText}>{title}</Text>
      <Feather name="chevron-right" size={16} color="#D1D9E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.greetingTitle}>¿En qué podemos ayudarte, Roberto?</Text>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA8B6" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Busca un problema o duda..."
            placeholderTextColor="#9CA8B6"
          />
        </View>

        <View style={styles.actionCardsRow}>
          <TouchableOpacity 
            style={styles.actionCardDark}
            onPress={() => router.push('/tech-support-chat' as any)}
          >
            <View style={styles.actionIconDark}>
              <Feather name="message-circle" size={18} color="#7A8C9E" />
            </View>
            <Text style={styles.actionTitleDark}>CHAT EN VIVO</Text>
            <Text style={styles.actionSubtitleDark}>Tiempo de espera: {'<'} 2 min</Text>
          </TouchableOpacity>

          <View style={{ width: 15 }} />

          <TouchableOpacity style={styles.actionCardLight}>
            <View style={styles.actionIconLight}>
              <Feather name="alert-triangle" size={18} color="#FF6B6B" />
            </View>
            <Text style={styles.actionTitleLight}>EMERGENCIA</Text>
            <Text style={styles.actionSubtitleLight}>Problemas de seguridad en ruta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>PREGUNTAS FRECUENTES</Text>

        <View style={styles.faqList}>
          <TouchableOpacity style={styles.faqItemWithIcon}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="credit-card" size={18} color="#7A8C9E" style={{ marginRight: 15 }} />
              <Text style={styles.faqTextIcon}>PAGOS Y RETIROS</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#D1D9E0" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.faqItemWithIcon}
            onPress={() => router.push('/tech-profile-verification' as any)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="user" size={18} color="#7A8C9E" style={{ marginRight: 15 }} />
              <Text style={styles.faqTextIcon}>VALIDACIÓN DE CUENTA</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#D1D9E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.faqItemWithIcon}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="x" size={18} color="#7A8C9E" style={{ marginRight: 15 }} />
              <Text style={styles.faqTextIcon}>CANCELACIONES Y PENALIZACIONES</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#D1D9E0" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>TUS CONSULTAS</Text>
          <Text style={styles.viewAllText}>VER TODAS</Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View style={styles.ticketDot} />
            <View>
              <Text style={styles.ticketTitle}>CLIENTE NO SE PRESENTÓ</Text>
              <Text style={styles.ticketMeta}>#TKT-4921 - Hace 2 semanas</Text>
            </View>
          </View>
          <View style={styles.ticketStatusBadge}>
            <Text style={styles.ticketStatusText}>RESUELTO</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  
  greetingTitle: { fontSize: 24, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 25 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  searchInput: { flex: 1, fontSize: 14, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  actionCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  actionCardDark: { flex: 1, backgroundColor: '#0A192F', borderRadius: 8, padding: 20, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5 },
  actionIconDark: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  actionTitleDark: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5, marginBottom: 6 },
  actionSubtitleDark: { fontSize: 8, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  actionCardLight: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFF5F5', borderRadius: 8, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  actionIconLight: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  actionTitleLight: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 6 },
  actionSubtitleLight: { fontSize: 8, color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 20 },
  viewAllText: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  
  faqList: { marginBottom: 20 },
  faqItemWithIcon: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#F0F4F8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 2, elevation: 1 },
  faqTextIcon: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  faqItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  faqText: { fontSize: 14, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  ticketCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 2, elevation: 1 },
  ticketHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  ticketDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D9E0', marginTop: 4, marginRight: 15, borderWidth: 2, borderColor: '#F0F4F8' },
  ticketTitle: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 4 },
  ticketMeta: { fontSize: 9, color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  ticketStatusBadge: { alignSelf: 'flex-start', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginLeft: 23 },
  ticketStatusText: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
});
