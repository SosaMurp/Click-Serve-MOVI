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

export default function TechWithdraw() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retirar Fondos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Amount Section */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionLabelCenter}>MONTO A RETIRAR</Text>
          
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amountValue}>1420.00</Text>
          </View>
          
          <View style={styles.availableRow}>
            <Text style={styles.availableText}>Disponible: $1,420.00</Text>
            <TouchableOpacity style={styles.maxBadge}>
              <Text style={styles.maxBadgeText}>RETIRAR MÁXIMO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>$500</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>$1,000</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chipActive}>
              <Text style={styles.chipTextActive}>Máximo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transfer To */}
        <Text style={styles.sectionLabelLeft}>TRANSFERIR A</Text>
        
        <View style={styles.accountCard}>
          <View style={styles.accountCardLeft}>
            <View style={styles.accountIconWrapper}>
              <Feather name="credit-card" size={18} color="#0A192F" />
            </View>
            <View>
              <Text style={styles.accountName}>BBVA Bancomer</Text>
              <Text style={styles.accountClabe}>CLABE **** 5678</Text>
            </View>
          </View>
          <Feather name="check" size={16} color="#10B981" />
        </View>

        {/* Summary */}
        <Text style={styles.sectionLabelLeft}>RESUMEN DE TRANSACCIÓN</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monto de retiro</Text>
            <Text style={styles.summaryValue}>$1,420.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Comisión Click&Serve</Text>
            <Text style={styles.summaryValueFree}>¡Gratis!</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>TOTAL A RECIBIR</Text>
            <Text style={styles.summaryTotalValue}>$1,420.00</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => router.push('/tech-wallet' as any)}
        >
          <Text style={styles.confirmButtonText}>CONFIRMAR TRANSFERENCIA</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          OPERACIÓN PROTEGIDA. LOS FONDOS SE REFLEJARÁN EN TU CUENTA EN UN MÁXIMO DE 24 HRS HÁBILES.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFFFFF' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingBottom: 40 },
  
  amountSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', marginBottom: 25 },
  sectionLabelCenter: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 25 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  currencySymbol: { fontSize: 24, fontWeight: '800', color: '#C4CDD5', marginRight: 10 },
  amountValue: { fontSize: 42, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  availableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  availableText: { fontSize: 10, color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginRight: 10 },
  maxBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  maxBadgeText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  
  chipsRow: { flexDirection: 'row', justifyContent: 'center' },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#F0F4F8', marginHorizontal: 5 },
  chipText: { fontSize: 10, fontWeight: '800', color: '#0A192F' },
  chipActive: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#0A192F', marginHorizontal: 5 },
  chipTextActive: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },

  sectionLabelLeft: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginLeft: 25, marginBottom: 15 },
  
  accountCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginHorizontal: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  accountCardLeft: { flexDirection: 'row', alignItems: 'center' },
  accountIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F0F4F8' },
  accountName: { fontSize: 13, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  accountClabe: { fontSize: 10, color: '#9CA8B6', letterSpacing: 1 },

  summaryCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 25, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  summaryLabel: { fontSize: 10, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  summaryValue: { fontSize: 11, fontWeight: '800', color: '#0A192F' },
  summaryValueFree: { fontSize: 11, fontWeight: '800', color: '#10B981' },
  summaryDivider: { height: 1, backgroundColor: '#F0F4F8', marginVertical: 15 },
  summaryTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  summaryTotalLabel: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  summaryTotalValue: { fontSize: 18, fontWeight: '800', color: '#0A192F' },

  footer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  confirmButton: { flexDirection: 'row', backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  footerNote: { fontSize: 7, fontWeight: '800', color: '#E1E8ED', letterSpacing: 1.5, textAlign: 'center', lineHeight: 12 },
});
