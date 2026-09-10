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

export default function OrderStatus() {
  const router = useRouter();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', paddingRight: 24 }}>
          <Text style={styles.headerTitle}>Orden #2901</Text>
          <Text style={styles.headerSubtitle}>SOPORTE TÉCNICO</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Status Area */}
        <View style={styles.statusArea}>
          <View style={styles.clockPulseWrapper}>
            <View style={styles.clockOuter}>
              <Feather name="clock" size={24} color="#F97316" />
            </View>
          </View>
          
          <Text style={styles.statusTitle}>Esperando confirmación</Text>
          <Text style={styles.statusSubtitle}>
            Le hemos enviado tu solicitud al técnico. Te notificaremos en cuanto acepte el trabajo.
          </Text>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: '#0A192F' }]} />
              <Text style={[styles.stepLabel, { color: '#0A192F' }]}>ENVIADO</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: '#F97316' }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: '#F97316' }]} />
              <Text style={[styles.stepLabel, { color: '#F97316' }]}>ESPERA</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={styles.stepDot} />
              <Text style={styles.stepLabel}>EN CAMINO</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={styles.stepDot} />
              <Text style={styles.stepLabel}>FIN</Text>
            </View>
          </View>
        </View>

        {/* Tech Info */}
        <Text style={styles.sectionTitle}>TÉCNICO SOLICITADO</Text>
        <View style={styles.techCard}>
          <View style={styles.techInfoLeft}>
            <View style={styles.techAvatar} />
            <View>
              <Text style={styles.techName}>Roberto G.</Text>
              <View style={styles.techMeta}>
                <View style={styles.techRoleBadge}>
                  <Text style={styles.techRoleText}>Hardware</Text>
                </View>
                <Text style={styles.techRating}>★ 4.9</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/tech-chat' as any)}>
            <Feather name="message-circle" size={20} color="#7A8C9E" />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>RESUMEN</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Feather name="map-pin" size={16} color="#9CA8B6" style={{ marginTop: 2, marginRight: 10 }} />
            <View>
              <Text style={styles.summaryLabel}>UBICACIÓN</Text>
              <Text style={styles.summaryText}>Col. Centro, Calle Melchor Ocampo #45</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishSimulateButton} onPress={() => router.push('/confirm-service' as any)}>
          <Text style={styles.finishSimulateButtonText}>SIMULAR FINALIZACIÓN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(true)}>
          <Text style={styles.cancelButtonText}>CANCELAR SOLICITUD</Text>
        </TouchableOpacity>
        <Text style={styles.footerHint}>No se te cobrará nada si cancelas ahora.</Text>
      </View>

      {/* Cancel Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCancelModalVisible(false)} style={{ padding: 15 }}>
              <Feather name="x" size={24} color="#0A192F" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Detalle de Cancelación</Text>
            <View style={{ width: 54 }} />
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.cancelCard}>
              <View style={styles.cancelIconWrapper}>
                <Feather name="slash" size={24} color="#7A8C9E" />
              </View>
              <Text style={styles.cancelTitle}>Servicio Cancelado</Text>
              <Text style={styles.cancelSubtitle}>EL TÉCNICO YA ESTABA EN RUTA</Text>

              <View style={styles.cancelDashedLine} />

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelStrikethrough}>DIAGNÓSTICO Y MANO DE OBRA</Text>
                <Text style={styles.breakdownValueStrikethrough}>$450.00</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>TARIFA DE CANCELACIÓN</Text>
                <Text style={styles.breakdownValue}>$50.00</Text>
              </View>

              <View style={styles.chargeCard}>
                <View>
                  <Text style={styles.chargeCardLabel}>CARGO A TARJETA</Text>
                  <Text style={styles.chargeCardValue}>VISA **** 4242</Text>
                </View>
                <Text style={styles.chargeAmount}>$50.00</Text>
              </View>

              <Text style={styles.cancelNote}>
                *Esta tarifa se transfiere al 100% a Roberto G. para compensar su tiempo y gastos de traslado iniciales.*
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.modalContinueButton}
              onPress={() => {
                setCancelModalVisible(false);
                router.replace('/client-dashboard');
              }}
            >
              <Text style={styles.modalContinueButtonText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  headerSubtitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },
  
  scrollContainer: { paddingBottom: 40 },
  
  statusArea: { backgroundColor: '#FFFFFF', paddingHorizontal: 30, paddingTop: 40, paddingBottom: 40, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', marginBottom: 20 },
  clockPulseWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  clockOuter: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  statusTitle: { fontSize: 22, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 10 },
  statusSubtitle: { fontSize: 11, color: '#7A8C9E', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10, marginBottom: 40 },
  
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  stepItem: { alignItems: 'center', width: 60 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginBottom: 8 },
  stepLabel: { fontSize: 7, fontWeight: '800', color: '#C4CDD5', letterSpacing: 1 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 4, marginBottom: 15 },

  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginLeft: 25, marginBottom: 15 },
  
  techCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 20, padding: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  techInfoLeft: { flexDirection: 'row', alignItems: 'center' },
  techAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E1E8ED', marginRight: 15 },
  techName: { fontSize: 14, fontWeight: '800', color: '#0A192F', marginBottom: 6 },
  techMeta: { flexDirection: 'row', alignItems: 'center' },
  techRoleBadge: { backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 },
  techRoleText: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1 },
  techRating: { fontSize: 10, fontWeight: '800', color: '#0A192F' },
  chatButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F4F8' },

  summaryCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, padding: 20, borderRadius: 8, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start' },
  summaryLabel: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 4 },
  summaryText: { fontSize: 12, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  footer: { backgroundColor: '#FFFFFF', paddingHorizontal: 25, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  finishSimulateButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 10 },
  finishSimulateButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  cancelButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF6B6B', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 15 },
  cancelButtonText: { color: '#FF6B6B', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  footerHint: { fontSize: 9, color: '#9CA8B6', textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  modalHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  modalBody: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 25, justifyContent: 'center' },
  cancelCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10, marginBottom: 30 },
  cancelIconWrapper: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  cancelTitle: { fontSize: 22, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 10 },
  cancelSubtitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 30 },
  cancelDashedLine: { width: '100%', height: 1, borderWidth: 1, borderColor: '#F0F4F8', borderStyle: 'dashed', marginBottom: 25 },
  
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  breakdownLabelStrikethrough: { fontSize: 8, fontWeight: '800', color: '#C4CDD5', letterSpacing: 1, textDecorationLine: 'line-through' },
  breakdownValueStrikethrough: { fontSize: 10, fontWeight: '700', color: '#C4CDD5', textDecorationLine: 'line-through' },
  breakdownLabel: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  breakdownValue: { fontSize: 12, fontWeight: '800', color: '#0A192F' },

  chargeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 8, marginTop: 10, marginBottom: 25 },
  chargeCardLabel: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 4 },
  chargeCardValue: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  chargeAmount: { fontSize: 18, fontWeight: '800', color: '#0A192F' },

  cancelNote: { fontSize: 9, color: '#9CA8B6', textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 14 },
  
  modalContinueButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center' },
  modalContinueButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
