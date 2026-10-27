import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from './context/AuthContext';

export default function PaymentMethods() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tarjetas, setTarjetas] = useState<any[]>([]);

  const loadPaymentMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/metodos-pago');
      if (res && res.status >= 400) {
        throw new Error(res.data?.error || `Error HTTP ${res.status}`);
      }
      if (res && res.data) {
        const list = res.data.metodos || res.data.tarjetas || [];
        setTarjetas(list);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de conexión al cargar métodos de pago.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPaymentMethods();
    }, [loadPaymentMethods])
  );

  const handleDeleteCard = (cardId: number | string) => {
    Alert.alert(
      '¿Eliminar tarjeta?',
      '¿Estás seguro de que deseas eliminar este método de pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete(`/api/metodos-pago/${cardId}`);
              if (res && res.status >= 400) {
                throw new Error(res.data?.error || `Error HTTP ${res.status}`);
              }
              Alert.alert('Éxito', 'Método de pago eliminado correctamente.');
              loadPaymentMethods();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al eliminar el método de pago.');
            }
          },
        },
      ]
    );
  };

  const primaryCard = tarjetas.length > 0 ? tarjetas[0] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>TARJETA PRINCIPAL</Text>

        {/* Main Card (Sleek dark card for premium visual contrast) */}
        <View style={styles.creditCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.chip} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.cardLogo}>Click&Serve</Text>
              {primaryCard && (
                <TouchableOpacity onPress={() => handleDeleteCard(primaryCard.id_metodo || primaryCard.id)} activeOpacity={0.8}>
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardLabel}>NÚMERO DE TARJETA</Text>
            <Text style={styles.cardNumber}>
              ****  ****  ****  {primaryCard?.ultimos_4 || '4242'}
            </Text>
          </View>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardLabel}>TITULAR</Text>
              <Text style={styles.cardText}>{primaryCard?.titular ? primaryCard.titular.toUpperCase() : 'CARLOS MENDIETA'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>EXPIRA</Text>
              <Text style={styles.cardText}>{primaryCard?.expiracion || '12/28'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>GESTIONAR MÉTODOS</Text>

        {/* Cash Option */}
        <TouchableOpacity style={styles.methodOption} activeOpacity={0.8}>
          <View style={styles.methodIconWrapper}>
            <Feather name="dollar-sign" size={18} color="#FF6B1A" />
          </View>
          <View style={styles.methodTextContainer}>
            <Text style={styles.methodTitle}>EFECTIVO</Text>
            <Text style={styles.methodSubtitle}>Pago en mano al finalizar servicio</Text>
          </View>
          <View style={styles.radioOuter}>
            <View style={styles.radioInner} />
          </View>
        </TouchableOpacity>

        {/* Link New Card Button */}
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/link-card' as any)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color="#FF6B1A" />
          <Text style={styles.linkButtonText}>VINCULAR NUEVA TARJETA</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Security Footer */}
      <View style={styles.securityFooter}>
        <Feather name="lock" size={12} color="#94A3B8" />
        <Text style={styles.securityText}>ENCRIPTADO SSL DE 256 BITS</Text>
      </View>
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
    paddingTop: 20, 
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 12, marginTop: 10 },
  
  creditCard: { 
    backgroundColor: '#0A192F', 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 25, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.12, 
    shadowRadius: 10, 
    elevation: 4 
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  chip: { width: 38, height: 26, borderRadius: 6, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' },
  cardLogo: { fontSize: 13, fontWeight: '800', color: '#FF6B1A', fontStyle: 'italic', letterSpacing: 0.5 },
  cardNumberContainer: { marginBottom: 24 },
  cardLabel: { fontSize: 8, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 6 },
  cardNumber: { fontSize: 20, color: '#FFFFFF', letterSpacing: 3, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },

  methodOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  methodIconWrapper: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: '#FFF7ED', 
    borderWidth: 1, 
    borderColor: '#FFEDD5', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14 
  },
  methodTextContainer: { flex: 1 },
  methodTitle: { fontSize: 12, fontWeight: '800', color: '#0A192F', letterSpacing: 0.5, marginBottom: 4 },
  methodSubtitle: { fontSize: 11, color: '#94A3B8' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#FF6B1A', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B1A' },
  
  linkButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 52, 
    minHeight: 52, 
    borderStyle: 'dashed', 
    borderWidth: 1.5, 
    borderColor: '#FF6B1A', 
    backgroundColor: '#FFF7ED', 
    borderRadius: 14, 
    marginBottom: 20 
  },
  linkButtonText: { fontSize: 11, fontWeight: '800', color: '#FF6B1A', letterSpacing: 1.5, marginLeft: 10 },
  
  securityFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  securityText: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginLeft: 8 },
});
