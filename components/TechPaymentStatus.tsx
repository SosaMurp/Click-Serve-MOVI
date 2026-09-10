import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechPaymentStatus() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estatus de Pago</Text>
        <Text style={styles.headerRef}>REF: 4PY-9982</Text>
      </View>

      <View style={styles.content}>
        
        {/* Success Icon */}
        <View style={styles.iconOuterGlow}>
          <View style={styles.iconWrapper}>
            <Feather name="check" size={32} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>¡Pago Procesado!</Text>
        
        <Text style={styles.subtitle}>
          EL SISTEMA HA REALIZADO EL COBRO AUTOMÁTICO A LA TARJETA DE <Text style={{ fontWeight: '800', color: '#0A192F' }}>JUAN PÉREZ</Text> CON ÉXITO.
        </Text>

        {/* Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>MONTO TOTAL</Text>
            <Text style={styles.summaryValue}>$535.00</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.profitLabel}>TU GANANCIA</Text>
            <Text style={styles.profitValue}>$428.00</Text>
          </View>

          <Text style={styles.commissionNote}>
            COMISIÓN DE PLATAFORMA (20%) APLICADA AUTOMÁTICAMENTE.
          </Text>
        </View>

      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/tech-rate-client' as any)}
        >
          <Text style={styles.actionButtonText}>FINALIZAR Y SALIR</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          EL RECIBO DIGITAL HA SIDO ENVIADO AL CORREO DEL CLIENTE.
        </Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 40 : 25, paddingBottom: 20 },
  headerTitle: { fontSize: 18, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerRef: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 },
  
  iconOuterGlow: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(10, 25, 47, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  iconWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },

  title: { fontSize: 26, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 15 },
  
  subtitle: { fontSize: 8, color: '#7A8C9E', letterSpacing: 1.5, textAlign: 'center', lineHeight: 16, marginBottom: 40, paddingHorizontal: 20 },

  summaryCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, width: '100%', padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  summaryLabel: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },
  summaryValue: { fontSize: 14, fontWeight: '800', color: '#0A192F' },
  
  profitLabel: { fontSize: 9, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  profitValue: { fontSize: 18, fontWeight: '800', color: '#10B981' },

  commissionNote: { fontSize: 7, fontWeight: '800', color: '#D1D9E0', letterSpacing: 1, textAlign: 'center', marginTop: 10 },

  footer: { paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25 },
  actionButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 20, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  actionButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  
  footerNote: { fontSize: 7, fontWeight: '800', color: '#C4CDD5', letterSpacing: 1.5, textAlign: 'center' },
});
