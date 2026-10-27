import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    question: '¿Cómo funcionan las garantías de servicio?',
    answer: 'Todos los servicios contratados a través de Click-Serve cuentan con garantía de satisfacción. Si el problema persiste dentro de los primeros 15 días posteriores al trabajo, el técnico revisará el servicio sin costo adicional.',
  },
  {
    id: '2',
    question: 'Métodos de facturación para empresas',
    answer: 'Puedes solicitar factura con validez fiscal (CFDI) agregando tus datos fiscales desde tu Perfil > Facturación o notificándolo al completar la orden en el desglose de pago.',
  },
  {
    id: '3',
    question: 'Seguridad y verificación de técnicos',
    answer: 'Cada técnico en Click-Serve pasa por una exhaustiva verificación de antecedentes, validación de certificaciones SEP / CONOCER y reconocimiento biométrico facial previo a cada servicio.',
  },
  {
    id: '4',
    question: '¿Qué hacer si el técnico se demora o no llega?',
    answer: 'Puedes monitorear la ubicación del técnico en tiempo real en la pantalla de la orden o contactarlo directamente por el chat interno. Si no responde, comunícate con soporte de inmediato.',
  },
];

export default function Support() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(prev => (prev === id ? null : id));
  };

  const handleOpenEmail = () => {
    const url = 'mailto:soporte@clickserve.com?subject=Ayuda%20Click-Serve';
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de correo.');
    });
  };

  const handleMakeCall = () => {
    const url = 'tel:1234567890';
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de llamadas.');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centro de Soporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Help Card en Modo Claro */}
        <View style={styles.helpCard}>
          <View style={styles.helpIconBadge}>
            <Feather name="headphones" size={24} color="#FF6B1A" />
          </View>
          <Text style={styles.helpTitle}>¿Cómo podemos ayudarte?</Text>
          <Text style={styles.helpSubtitle}>
            Nuestro equipo de asistencia técnica y atención al cliente está disponible para ti 24/7.
          </Text>
          
          <TouchableOpacity 
            style={styles.chatButton} 
            onPress={() => router.push('/support-chat' as any)}
            activeOpacity={0.8}
          >
            <Feather name="message-circle" size={18} color="#FFFFFF" />
            <Text style={styles.chatButtonText}>INICIAR CHAT EN VIVO</Text>
          </TouchableOpacity>
        </View>

        {/* Acordeón de Preguntas Frecuentes */}
        <Text style={styles.sectionTitle}>PREGUNTAS FRECUENTES</Text>

        <View style={styles.faqContainer}>
          {FAQS.map(faq => {
            const isOpen = expandedFaq === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity 
                  style={styles.faqItem} 
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.faqText, isOpen && { color: '#FF6B1A' }]}>{faq.question}</Text>
                  <Feather 
                    name={isOpen ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={isOpen ? '#FF6B1A' : '#64748B'} 
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Otras Formas de Contacto */}
        <Text style={styles.contactTitle}>OTRAS FORMAS DE CONTACTO</Text>

        <View style={styles.contactMethods}>
          <TouchableOpacity 
            style={styles.contactOption} 
            onPress={handleOpenEmail}
            activeOpacity={0.8}
          >
            <View style={styles.contactIconWrapper}>
              <Feather name="mail" size={22} color="#FF6B1A" />
            </View>
            <Text style={styles.contactLabel}>EMAIL</Text>
            <Text style={styles.contactSub}>soporte@clickserve.com</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactOption} 
            onPress={handleMakeCall}
            activeOpacity={0.8}
          >
            <View style={styles.contactIconWrapper}>
              <Feather name="phone-call" size={22} color="#FF6B1A" />
            </View>
            <Text style={styles.contactLabel}>LLAMAR</Text>
            <Text style={styles.contactSub}>(123) 456-7890</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 18, 
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#0F172A', 
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' 
  },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  
  /* Tarjeta de Asistencia */
  helpCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 22, 
    marginBottom: 26, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3 
  },
  helpIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  helpTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#0F172A', 
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  helpSubtitle: { 
    fontSize: 13, 
    color: '#64748B', 
    lineHeight: 18, 
    marginBottom: 20 
  },
  chatButton: { 
    flexDirection: 'row', 
    backgroundColor: '#FF6B1A', 
    height: 50,
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  chatButtonText: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    letterSpacing: 1.2, 
    marginLeft: 8 
  },

  /* Preguntas Frecuentes */
  sectionTitle: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#94A3B8', 
    letterSpacing: 1.5, 
    marginBottom: 12 
  },
  faqContainer: { marginBottom: 28 },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  faqItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  faqText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#0F172A', 
    flex: 1, 
    paddingRight: 12 
  },
  faqAnswerBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19
  },

  /* Contacto */
  contactTitle: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#94A3B8', 
    letterSpacing: 1.5, 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  contactMethods: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 14 
  },
  contactOption: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    paddingVertical: 18, 
    paddingHorizontal: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2
  },
  contactIconWrapper: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#FFF7ED', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#FFEDD5' 
  },
  contactLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#0F172A', 
    letterSpacing: 1,
    marginBottom: 2
  },
  contactSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center'
  }
});
