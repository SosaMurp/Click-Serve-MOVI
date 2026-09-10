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

export default function TechProfileVerification() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificación de Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrapper}>
              <Feather name="shield" size={16} color="#7A8C9E" />
            </View>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: '800', color: '#0A192F' }}>SEGURIDAD CLICK&SERVE: </Text>
              VALIDAMOS TU IDENTIDAD Y CREDENCIALES DE FORMA AUTOMATIZADA. ADJUNTA DOCUMENTOS EXTRA PARA AGILIZAR REVISIONES MANUALES.
            </Text>
          </View>

          {/* Step 1 */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>1. IDENTIDAD VISUAL</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>REQUERIDO</Text>
              </View>
            </View>

            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadBox}>
                <Feather name="image" size={20} color="#9CA8B6" style={{ marginBottom: 10 }} />
                <Text style={styles.uploadText}>FOTO INE (FRENTE)</Text>
              </TouchableOpacity>
              
              <View style={{ width: 15 }} />

              <TouchableOpacity style={styles.uploadBox}>
                <Feather name="user" size={20} color="#9CA8B6" style={{ marginBottom: 10 }} />
                <Text style={styles.uploadText}>SELFIE ACTUAL</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>2. CÉDULA PROFESIONAL</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>REQUERIDO</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>NÚMERO DE CÉDULA</Text>
            <View style={styles.inputContainer}>
              <Feather name="credit-card" size={16} color="#D1D9E0" style={{ marginRight: 10 }} />
              <TextInput 
                style={styles.textInput}
                placeholder="Ej. 12345678"
                placeholderTextColor="#D1D9E0"
                keyboardType="numeric"
              />
              <Feather name="search" size={16} color="#D1D9E0" />
            </View>

            <Text style={styles.inputLabel}>ESPECIALIDAD A VALIDAR</Text>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>Soporte Técnico y Hardware</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>3. EVIDENCIA ADICIONAL</Text>
              <View style={styles.manualBadge}>
                <Text style={styles.manualText}>RESPALDO MANUAL</Text>
              </View>
            </View>
            
            <Text style={styles.stepDescription}>
              Sube diplomas, certificaciones de TI o portafolio. Nuestro equipo lo revisará en caso de que la validación automática de tu cédula requiera soporte.
            </Text>

            <TouchableOpacity style={styles.uploadBoxFull}>
              <Feather name="upload-cloud" size={24} color="#9CA8B6" style={{ marginBottom: 10 }} />
            </TouchableOpacity>
          </View>

        </ScrollView>
        
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => router.push('/tech-validating-profile' as any)}
          >
            <Text style={styles.submitButtonText}>INICIAR VALIDACIÓN</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 5, marginLeft: -5, marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  
  infoCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginBottom: 20, alignItems: 'center' },
  infoIconWrapper: { marginRight: 15 },
  infoText: { flex: 1, fontSize: 8, color: '#7A8C9E', letterSpacing: 1, lineHeight: 14, textTransform: 'uppercase' },

  stepCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 25, marginBottom: 20 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  requiredBadge: { backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  requiredText: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },
  manualBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  manualText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },

  uploadRow: { flexDirection: 'row', justifyContent: 'space-between' },
  uploadBox: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 35, alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },

  inputLabel: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', paddingBottom: 10, marginBottom: 25 },
  textInput: { flex: 1, fontSize: 14, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  dropdownContainer: { backgroundColor: '#F8FAFC', borderRadius: 4, padding: 15 },
  dropdownText: { fontSize: 12, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  stepDescription: { fontSize: 10, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 18, marginBottom: 20 },
  uploadBoxFull: { width: '100%', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 35, alignItems: 'center', justifyContent: 'center' },

  footer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  submitButton: { flexDirection: 'row', backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
