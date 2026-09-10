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

export default function TechBillingSummary() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen de Cobro</Text>
        <Text style={styles.headerId}>ID: #CK-2901</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>Soporte Técnico</Text>
          <Text style={styles.clientInfo}>CLIENTE: JUAN PÉREZ • COL. CENTRO</Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>MANO DE OBRA (MXN)</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amountValue}>450</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>REFACCIONES Y MATERIALES</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>Ej. Pasta Térmica</Text>
            <View style={styles.itemAmountRow}>
              <Text style={styles.itemCurrency}>$</Text>
              <Text style={styles.itemValue}>0.00</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.addItemButton}>
            <Feather name="plus" size={12} color="#9CA8B6" style={{ marginRight: 8 }} />
            <Text style={styles.addItemText}>AGREGAR OTRO CONCEPTO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL A COBRAR</Text>
          <Text style={styles.totalValue}>$450.00</Text>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => router.push('/tech-payment-status' as any)}
        >
          <Text style={styles.submitButtonText}>ENVIAR RECIBO AL CLIENTE</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          AL ENVIAR, EL CLIENTE RECIBIRÁ UNA NOTIFICACIÓN PARA CONFIRMAR EL CARGO Y CALIFICAR EL SERVICIO.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 40 : 25, paddingBottom: 25 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerId: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },

  scrollContainer: { paddingHorizontal: 25, paddingBottom: 40 },
  
  serviceInfo: { marginBottom: 40 },
  serviceTitle: { fontSize: 20, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 8 },
  clientInfo: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },

  sectionBlock: { marginBottom: 35 },
  sectionLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15 },
  
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 16, fontWeight: '800', color: '#9CA8B6', marginRight: 15 },
  amountValue: { fontSize: 16, fontWeight: '800', color: '#0A192F', letterSpacing: 2 },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  itemText: { fontSize: 13, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  itemAmountRow: { flexDirection: 'row', alignItems: 'center' },
  itemCurrency: { fontSize: 10, color: '#D1D9E0', marginRight: 10 },
  itemValue: { fontSize: 12, fontWeight: '800', color: '#7A8C9E' },

  addItemButton: { flexDirection: 'row', alignItems: 'center' },
  addItemText: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },

  totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A192F', borderRadius: 8, padding: 25, marginTop: 10, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  totalLabel: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  footer: { paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, paddingTop: 20 },
  submitButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 15 },
  submitButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  footerNote: { fontSize: 7, fontWeight: '800', color: '#C4CDD5', letterSpacing: 1, textAlign: 'center', lineHeight: 12 },
});
