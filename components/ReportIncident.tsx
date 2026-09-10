import React, { useState } from 'react';
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

export default function ReportIncident() {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState(0);

  const reasons = [
    "El técnico nunca llegó al domicilio",
    "Se marcó como finalizado sin realizar el trabajo",
    "El técnico se retiró antes de tiempo"
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar Incidencia</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.alertCard}>
            <View style={styles.alertIconWrapper}>
              <Feather name="alert-triangle" size={16} color="#FF6B6B" />
            </View>
            <Text style={styles.alertTitle}>Lamentamos el inconveniente</Text>
            <Text style={styles.alertSubtitle}>TU SEGURIDAD Y TIEMPO SON NUESTRA PRIORIDAD.{'\n'}CUÉNTANOS QUÉ SUCEDIÓ CON ROBERTO G.</Text>
          </View>

          <Text style={styles.sectionTitle}>SELECCIONA EL MOTIVO</Text>

          <View style={styles.optionsContainer}>
            {reasons.map((reason, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.optionItem}
                onPress={() => setSelectedReason(index)}
              >
                <Text style={styles.optionText}>{reason}</Text>
                <View style={[styles.radioOuter, selectedReason === index && styles.radioOuterSelected]}>
                  {selectedReason === index && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>DETALLES ADICIONALES (OPCIONAL)</Text>

          <TextInput 
            style={styles.textArea} 
            placeholder="Describe brevemente la situación..."
            placeholderTextColor="#9CA8B6"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => router.push('/resolution' as any)}
          >
            <Text style={styles.submitButtonText}>ENVIAR REPORTE Y SOPORTE</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>UN AGENTE DE CLICK&SERVE REVISARÁ ESTE CASO{'\n'}EN LOS PRÓXIMOS 15 MINUTOS</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 40 },
  
  alertCard: { backgroundColor: '#FFF5F5', borderRadius: 8, padding: 30, alignItems: 'center', marginBottom: 40 },
  alertIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFE5E5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 10, textAlign: 'center' },
  alertSubtitle: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, textAlign: 'center', lineHeight: 14 },

  sectionTitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15 },
  
  optionsContainer: { marginBottom: 30 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', padding: 20, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  optionText: { fontSize: 12, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', flex: 1, paddingRight: 20 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E1E8ED', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: '#0A192F' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0A192F' },

  textArea: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', paddingVertical: 15, fontSize: 14, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  footer: { paddingHorizontal: 25, paddingVertical: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  submitButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 15 },
  submitButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  footerNote: { fontSize: 7, fontWeight: '800', color: '#E1E8ED', letterSpacing: 1.5, textAlign: 'center', lineHeight: 12 },
});
