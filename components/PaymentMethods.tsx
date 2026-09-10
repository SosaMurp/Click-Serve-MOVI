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

export default function PaymentMethods() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>TARJETA PRINCIPAL</Text>

        {/* Main Card */}
        <View style={styles.creditCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.chip} />
            <Text style={styles.cardLogo}>Click&Serve</Text>
          </View>
          
          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardLabel}>NÚMERO DE TARJETA</Text>
            <Text style={styles.cardNumber}>****  ****  ****  4242</Text>
          </View>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardLabel}>TITULAR</Text>
              <Text style={styles.cardText}>CARLOS MENDIETA</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>EXPIRA</Text>
              <Text style={styles.cardText}>12/28</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>GESTIONAR MÉTODOS</Text>

        {/* Cash Option */}
        <TouchableOpacity style={styles.methodOption}>
          <View style={styles.methodIconWrapper}>
            <Feather name="dollar-sign" size={18} color="#0A192F" />
          </View>
          <View style={styles.methodTextContainer}>
            <Text style={styles.methodTitle}>EFECTIVO</Text>
            <Text style={styles.methodSubtitle}>Pago en mano al finalizar servicio</Text>
          </View>
          <View style={styles.radioOuter}>
            {/* If selected, add an inner circle */}
          </View>
        </TouchableOpacity>

        {/* Link New Card Button */}
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/link-card' as any)}
        >
          <Feather name="plus" size={16} color="#0A192F" />
          <Text style={styles.linkButtonText}>VINCULAR NUEVA TARJETA</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Security Footer */}
      <View style={styles.securityFooter}>
        <Feather name="lock" size={12} color="#9CA8B6" />
        <Text style={styles.securityText}>ENCRIPTADO SSL DE 256 BITS</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15, marginTop: 10 },
  
  creditCard: { backgroundColor: '#0A192F', borderRadius: 16, padding: 25, marginBottom: 30, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  chip: { width: 40, height: 25, borderRadius: 4, backgroundColor: '#3A4B60', borderWidth: 1, borderColor: '#4A5B70' },
  cardLogo: { fontSize: 12, fontWeight: '800', color: '#FFFFFF', fontStyle: 'italic', letterSpacing: 0.5 },
  cardNumberContainer: { marginBottom: 30 },
  cardLabel: { fontSize: 8, fontWeight: '700', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 6 },
  cardNumber: { fontSize: 22, color: '#FFFFFF', letterSpacing: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

  methodOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#F0F4F8', marginBottom: 20 },
  methodIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  methodTextContainer: { flex: 1 },
  methodTitle: { fontSize: 12, fontWeight: '800', color: '#0A192F', letterSpacing: 0.5, marginBottom: 4 },
  methodSubtitle: { fontSize: 12, color: '#7A8C9E', fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E1E8ED', justifyContent: 'center', alignItems: 'center' },
  
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D9E0', borderRadius: 4, marginBottom: 25 },
  linkButtonText: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginLeft: 10 },
  
  securityFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  securityText: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginLeft: 8 },
});
