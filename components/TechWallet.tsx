import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getBilletera, Billetera } from '../services/walletApi';

export default function TechWallet() {
  const router = useRouter();
  const [billetera, setBilletera] = useState<Billetera | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBilletera();
      setBilletera(data);
    } catch (error: any) {
      console.error('Error al cargar la billetera:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);


  const formatSaldo = (saldo: string | number | undefined) => {
    const val = typeof saldo === 'string' ? parseFloat(saldo) : saldo || 0;
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const maskedClabe = (clabe: string | null | undefined) => {
    if (!clabe || clabe.length < 4) return 'Sin cuenta registrada';
    return `CLABE **** ${clabe.slice(-4)}`;
  };

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
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.balanceAmount}>{formatSaldo(billetera?.saldo_actual)}</Text>
            )}
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
            <Text style={styles.changeLink}>
              {billetera?.clabe_interbancaria ? 'CAMBIAR' : 'REGISTRAR'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.accountCardLeft}>
            <View style={styles.accountIconWrapper}>
              <Feather name="credit-card" size={18} color="#0A192F" />
            </View>
            <View>
              <Text style={styles.accountName}>
                {billetera?.clabe_interbancaria ? 'Cuenta Bancaria' : 'Sin Cuenta'}
              </Text>
              <Text style={styles.accountClabe}>{maskedClabe(billetera?.clabe_interbancaria)}</Text>
            </View>
          </View>
          {billetera?.clabe_interbancaria ? (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>ACTIVA</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.registerBadge}
              onPress={() => router.push('/tech-bank-account' as any)}
            >
              <Text style={styles.registerBadgeText}>REGISTRAR</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.bankActionButton}
          onPress={() => router.push('/tech-bank-account' as any)}
        >
          <Feather name="edit-3" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.bankActionButtonText}>
            {billetera?.clabe_interbancaria ? 'EDITAR CUENTA BANCARIA' : 'REGISTRAR CUENTA BANCARIA'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.accountNote}>Las transferencias pueden tardar hasta 24 hrs hábiles.</Text>

        {/* Recent Transactions */}
        <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 20 }]}>ÚLTIMOS MOVIMIENTOS</Text>

        <View style={styles.transactionList}>
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[styles.txIconWrapper, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                <Feather name="plus" size={16} color="#10B981" />
              </View>
              <View>
                <Text style={styles.txTitle}>Pago de Servicio</Text>
                <Text style={styles.txSubtitle}>#CK-0901 • Servicio Completado</Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.txAmount, { color: '#10B981' }]}>+$428.00</Text>
              <Text style={styles.txDate}>RECIENTE</Text>
            </View>
          </View>
        </View>

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

  accountCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  accountCardLeft: { flexDirection: 'row', alignItems: 'center' },
  accountIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F0F4F8' },
  accountName: { fontSize: 13, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  accountClabe: { fontSize: 10, color: '#9CA8B6', letterSpacing: 1 },
  activeBadge: { flexDirection: 'row', alignItems: 'center' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  activeText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  
  registerBadge: { backgroundColor: '#0A192F', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  registerBadgeText: { fontSize: 8, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

  bankActionButton: { flexDirection: 'row', backgroundColor: '#0A192F', paddingVertical: 14, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  bankActionButtonText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

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
});
