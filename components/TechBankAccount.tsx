import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getBilletera, updateClabe } from '../services/walletApi';

export default function TechBankAccount() {
  const router = useRouter();
  const [currentClabe, setCurrentClabe] = useState<string | null>(null);
  const [clabeInput, setClabeInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadCurrentWallet();
  }, []);

  const loadCurrentWallet = async () => {
    try {
      setLoading(true);
      const data = await getBilletera();
      setCurrentClabe(data.clabe_interbancaria);
      if (data.clabe_interbancaria) {
        setClabeInput(data.clabe_interbancaria);
      }
    } catch (error) {
      console.error('Error al obtener cuenta bancaria:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const clean = clabeInput.trim();
    if (clean.length !== 18 || !/^\d+$/.test(clean)) {
      Alert.alert('CLABE Inválida', 'La CLABE interbancaria debe contener exactamente 18 dígitos numéricos.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateClabe(clean);
      Alert.alert('Éxito', res.mensaje || 'Cuenta bancaria guardada correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const errMsg = error.response?.data?.error || 'No se pudo guardar la cuenta bancaria.';
      Alert.alert('Error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = clabeInput.trim().length === 18 && /^\d+$/.test(clabeInput.trim());

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cuenta de Depósito</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>CUENTA ACTUAL</Text>
            {currentClabe ? <View style={styles.activeDot} /> : null}
          </View>

          <View style={styles.currentAccountCard}>
            <View style={styles.accountInfoLeft}>
              <View style={styles.accountIconWrapper}>
                <Feather name="credit-card" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.accountName}>
                  {currentClabe ? 'Cuenta Bancaria' : 'Sin cuenta vinculada'}
                </Text>
                <Text style={styles.accountClabe}>
                  {currentClabe ? `CLABE **** ${currentClabe.slice(-4)}` : 'Ingrese una CLABE de 18 dígitos abajo'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>VINCULAR O EDITAR CUENTA</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>CLABE INTERBANCARIA (18 DÍGITOS)</Text>
            <View style={styles.inputContainer}>
              <Feather name="credit-card" size={16} color="#0A192F" style={{ marginRight: 10 }} />
              <TextInput 
                style={styles.textInput}
                placeholder="000000000000000000"
                placeholderTextColor="#D1D9E0"
                keyboardType="numeric"
                maxLength={18}
                value={clabeInput}
                onChangeText={setClabeInput}
              />
            </View>
            <Text style={styles.digitsCount}>{clabeInput.trim().length} / 18 dígitos</Text>
          </View>

          <View style={styles.alertCard}>
            <Feather name="info" size={16} color="#D97706" style={{ marginRight: 15, marginTop: 2 }} />
            <Text style={styles.alertText}>
              <Text style={{ fontWeight: '800' }}>INFORMACIÓN: </Text>
              Asegúrate de ingresar una CLABE de 18 dígitos válida a tu nombre para recibir tus retiros directamente en tu cuenta de débito.
            </Text>
          </View>

        </ScrollView>
        
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, (!isFormValid || submitting) && styles.submitButtonDisabled]}
            disabled={!isFormValid || submitting}
            onPress={handleSave}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="upload" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>GUARDAR CUENTA BANCARIA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFFFFF' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },

  currentAccountCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A192F', borderRadius: 8, padding: 20, marginBottom: 35, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5 },
  accountInfoLeft: { flexDirection: 'row', alignItems: 'center' },
  accountIconWrapper: { width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  accountName: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  accountClabe: { fontSize: 10, color: '#9CA8B6', letterSpacing: 1 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 35 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F4F8' },
  dividerText: { fontSize: 8, fontWeight: '800', color: '#D1D9E0', letterSpacing: 1.5, marginHorizontal: 15 },

  formCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 25, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  inputLabel: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 10 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#0A192F', paddingBottom: 10, marginBottom: 8 },
  textInput: { flex: 1, fontSize: 14, color: '#0A192F', fontWeight: '700', letterSpacing: 1 },
  digitsCount: { fontSize: 9, color: '#9CA8B6', textAlign: 'right', marginTop: 4 },

  alertCard: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 8, padding: 15, marginBottom: 20 },
  alertText: { flex: 1, fontSize: 8, color: '#D97706', letterSpacing: 0.5, lineHeight: 14 },

  footer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  submitButton: { flexDirection: 'row', backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  submitButtonDisabled: { backgroundColor: '#9CA8B6' },
  submitButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
});
