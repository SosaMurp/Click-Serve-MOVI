import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Support() {
  const router = useRouter();

  const FAQItem = ({ question }: { question: string }) => (
    <TouchableOpacity style={styles.faqItem}>
      <Text style={styles.faqText}>{question}</Text>
      <Feather name="chevron-right" size={16} color="#D1D9E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Help Card */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>¿Cómo podemos ayudarte?</Text>
          <Text style={styles.helpSubtitle}>NUESTRO EQUIPO DE ASISTENCIA ESTÁ DISPONIBLE PARA TI 24/7</Text>
          
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/support-chat' as any)}>
            <Feather name="message-circle" size={16} color="#0A192F" />
            <Text style={styles.chatButtonText}>INICIAR CHAT EN VIVO</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>PREGUNTAS FRECUENTES</Text>

        <View style={styles.faqContainer}>
          <FAQItem question="¿Cómo funcionan las garantías de servicio?" />
          <FAQItem question="Métodos de facturación para empresas" />
          <FAQItem question="Seguridad y verificación de técnicos" />
        </View>

        <Text style={styles.contactTitle}>OTRAS FORMAS DE CONTACTO</Text>

        <View style={styles.contactMethods}>
          <TouchableOpacity style={styles.contactOption}>
            <View style={styles.contactIconWrapper}>
              <Feather name="mail" size={20} color="#0A192F" />
            </View>
            <Text style={styles.contactLabel}>EMAIL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactOption}>
            <View style={styles.contactIconWrapper}>
              <Feather name="phone-call" size={20} color="#0A192F" />
            </View>
            <Text style={styles.contactLabel}>LLAMAR</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  
  helpCard: { backgroundColor: '#0A192F', borderRadius: 8, padding: 25, marginBottom: 35, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  helpTitle: { fontSize: 22, color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 10 },
  helpSubtitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, lineHeight: 14, marginBottom: 25, width: '80%' },
  chatButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  chatButtonText: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginLeft: 10 },

  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15 },
  faqContainer: { marginBottom: 40 },
  faqItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  faqText: { fontSize: 14, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', flex: 1, paddingRight: 20 },

  contactTitle: { fontSize: 10, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 20, textAlign: 'center' },
  contactMethods: { flexDirection: 'row', justifyContent: 'center', gap: 40 },
  contactOption: { alignItems: 'center' },
  contactIconWrapper: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#F0F4F8' },
  contactLabel: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
});
