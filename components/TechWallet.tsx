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

export default function TechWallet() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billetera</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>SALDO DISPONIBLE</Text>
            <Feather name="info" size={14} color="#7A8C9E" />
          </View>
          <View style={styles.balanceAmountRow}>
            <Text style={styles.balanceAmount}>$1,420.00</Text>
            <Text style={styles.balanceCurrency}>MXN</Text>
          </View>
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={() => router.push('/tech-withdraw' as any)}
          >
            <Text style={styles.withdrawButtonText}>RETIRAR A BANCO</Text>
            <Feather name="external-link" size={14} color="#0A192F" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Deposit Account */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CUENTA DE DEPÓSITO</Text>
          <TouchableOpacity onPress={() => router.push('/tech-bank-account' as any)}>
            <Text style={styles.changeLink}>CAMBIAR</Text>
          </TouchableOpacity>
        </View>

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
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>ACTIVA</Text>
          </View>
        </View>
        <Text style={styles.accountNote}>Las transferencias pueden tardar hasta 24 hrs hábiles.</Text>

        {/* Recent Transactions */}
        <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 20 }]}>ÚLTIMOS MOVIMIENTOS</Text>

        <View style={styles.transactionList}>
          {/* Transaction 1 */}
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[styles.txIconWrapper, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                <Feather name="plus" size={16} color="#10B981" />
              </View>
              <View>
                <Text style={styles.txTitle}>Pago de Servicio</Text>
                <Text style={styles.txSubtitle}>#CK-0901 • Juan Pérez</Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.txAmount, { color: '#10B981' }]}>+$428.00</Text>
              <Text style={styles.txDate}>AYER</Text>
            </View>
          </View>

          {/* Transaction 2 */}
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[styles.txIconWrapper, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                <Feather name="plus" size={16} color="#10B981" />
              </View>
              <View>
                <Text style={styles.txTitle}>Compensación Cancelación</Text>
                <Text style={styles.txSubtitle}>#REQ-8821 • María G.</Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.txAmount, { color: '#10B981' }]}>+$50.00</Text>
              <Text style={styles.txDate}>12 FEB</Text>
            </View>
          </View>

          {/* Transaction 3 */}
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={styles.txIconWrapper}>
                <Feather name="arrow-down" size={16} color="#7A8C9E" />
              </View>
              <View>
                <Text style={styles.txTitle}>Retiro a Cuenta BBVA</Text>
                <Text style={styles.txSubtitle}>Transferencia SPEI</Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={styles.txAmount}>-$2,000.00</Text>
              <Text style={styles.txDate}>10 FEB</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>VER TODOS LOS MOVIMIENTOS</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  
  balanceCard: { backgroundColor: '#0A192F', borderRadius: 12, padding: 25, marginBottom: 30, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  balanceLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 25 },
  balanceAmount: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  balanceCurrency: { fontSize: 10, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1, marginLeft: 8 },
  withdrawButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  withdrawButtonText: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },
  changeLink: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },

  accountCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  accountCardLeft: { flexDirection: 'row', alignItems: 'center' },
  accountIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F0F4F8' },
  accountName: { fontSize: 13, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  accountClabe: { fontSize: 10, color: '#9CA8B6', letterSpacing: 1 },
  activeBadge: { flexDirection: 'row', alignItems: 'center' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  activeText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  
  accountNote: { fontSize: 8, color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  transactionList: { marginBottom: 20 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  transactionLeft: { flexDirection: 'row', alignItems: 'center' },
  txIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txTitle: { fontSize: 12, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  txSubtitle: { fontSize: 9, color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  transactionRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 12, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  txDate: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, textTransform: 'uppercase' },

  viewAllButton: { alignItems: 'center', paddingVertical: 15, marginTop: 10 },
  viewAllText: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
});
