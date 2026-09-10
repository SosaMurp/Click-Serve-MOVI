import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechBankAccount() {
  const router = useRouter();

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
            <View style={styles.activeDot} />
          </View>

          <View style={styles.currentAccountCard}>
            <View style={styles.accountInfoLeft}>
              <View style={styles.accountIconWrapper}>
                <Feather name="credit-card" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.accountName}>BBVA Bancomer</Text>
                <Text style={styles.accountClabe}>CLABE **** 5678</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>ELIMINAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>VINCULAR NUEVA</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formCard}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>TITULAR DE LA CUENTA</Text>
              <View style={styles.lockRow}>
                <Feather name="lock" size={10} color="#9CA8B6" style={{ marginRight: 4 }} />
                <Text style={styles.lockText}>SOLO CUENTAS A TU NOMBRE</Text>
              </View>
            </View>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>Roberto García (Técnico Verificado)</Text>
            </View>

            <Text style={styles.inputLabel}>INSTITUCIÓN BANCARIA</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Selecciona tu banco...</Text>
              <Feather name="chevron-down" size={16} color="#9CA8B6" />
            </View>

            <Text style={styles.inputLabel}>CLABE INTERBANCARIA (18 DÍGITOS)</Text>
            <View style={[styles.inputContainer, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Feather name="credit-card" size={16} color="#D1D9E0" style={{ marginRight: 10 }} />
              <TextInput 
                style={styles.textInput}
                placeholder="000 000 0000000000 0"
                placeholderTextColor="#D1D9E0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputUnderline} />
          </View>

          <View style={styles.alertCard}>
            <Feather name="info" size={16} color="#D97706" style={{ marginRight: 15, marginTop: 2 }} />
            <Text style={styles.alertText}>
              <Text style={{ fontWeight: '800' }}>PROTECCIÓN ANTIFRAUDE: </Text>
              AL ACTUALIZAR TU CUENTA, LOS RETIROS SE BLOQUEARÁN DURANTE 24 HORAS POR MOTIVOS DE SEGURIDAD.
            </Text>
          </View>

        </ScrollView>
        
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButtonDisabled}>
            <Feather name="upload" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>GUARDAR NUEVA CUENTA</Text>
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
  deleteButton: { backgroundColor: 'rgba(255, 107, 107, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4 },
  deleteButtonText: { fontSize: 8, fontWeight: '800', color: '#FF6B6B', letterSpacing: 1.5 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 35 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F4F8' },
  dividerText: { fontSize: 8, fontWeight: '800', color: '#D1D9E0', letterSpacing: 1.5, marginHorizontal: 15 },

  formCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 25, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  inputLabel: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  lockRow: { flexDirection: 'row', alignItems: 'center' },
  lockText: { fontSize: 7, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },
  disabledInput: { backgroundColor: '#F8FAFC', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 4, marginBottom: 25 },
  disabledInputText: { fontSize: 13, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  inputContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#0A192F', paddingBottom: 10, marginBottom: 25 },
  inputText: { fontSize: 14, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  textInput: { flex: 1, fontSize: 14, color: '#0A192F', fontWeight: '700', letterSpacing: 1 },
  inputUnderline: { height: 1, backgroundColor: '#F0F4F8', marginTop: 10 },

  alertCard: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FEF3C7', borderRadius: 8, padding: 15, marginBottom: 20 },
  alertText: { flex: 1, fontSize: 7, color: '#D97706', letterSpacing: 1, lineHeight: 12 },

  footer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  submitButtonDisabled: { flexDirection: 'row', backgroundColor: '#9CA8B6', paddingVertical: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
});
