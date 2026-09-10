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

export default function ServiceDetails() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Detalles del Servicio</Text>
          <Text style={styles.headerSubtitle}>SOPORTE TÉCNICO - PASO 1 DE 2</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionTitle}>DATOS DE CONTACTO</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
              <Text style={styles.label}>NOMBRE</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="Juan"
                placeholderTextColor="#9CA8B6"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>APELLIDOS</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="Pérez"
                placeholderTextColor="#9CA8B6"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TELÉFONO CELULAR</Text>
            <TextInput 
              style={styles.input} 
              defaultValue="753 123 4567"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA8B6"
            />
          </View>

          <Text style={styles.sectionTitle}>UBICACIÓN DEL SERVICIO</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2, marginRight: 15 }]}>
              <Text style={styles.label}>CALLE</Text>
              <View style={styles.inputWithIcon}>
                <Feather name="map-pin" size={14} color="#7A8C9E" style={{ marginRight: 8 }} />
                <TextInput 
                  style={[styles.input, { flex: 1, paddingHorizontal: 0, backgroundColor: 'transparent' }]} 
                  defaultValue="Av. Melchor Ocampo"
                  placeholderTextColor="#9CA8B6"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>NÚM. CASA</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="12-B"
                placeholderTextColor="#9CA8B6"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
              <Text style={styles.label}>COLONIA</Text>
              <View style={styles.inputWithIcon}>
                <TextInput 
                  style={[styles.input, { flex: 1, paddingHorizontal: 0, backgroundColor: 'transparent' }]} 
                  defaultValue="Centro"
                  placeholderTextColor="#9CA8B6"
                />
                <Feather name="chevron-down" size={16} color="#7A8C9E" />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CÓDIGO POSTAL</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="60950"
                keyboardType="numeric"
                placeholderTextColor="#9CA8B6"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>NECESIDAD ESPECÍFICA</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
              <Text style={styles.label}>FECHA PREFERIDA</Text>
              <View style={styles.inputWithIcon}>
                <Feather name="calendar" size={14} color="#7A8C9E" style={{ marginRight: 8 }} />
                <TextInput 
                  style={[styles.input, { flex: 1, paddingHorizontal: 0, backgroundColor: 'transparent' }]} 
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9CA8B6"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>HORA ESTIMADA</Text>
              <View style={styles.inputWithIcon}>
                <Feather name="clock" size={14} color="#7A8C9E" style={{ marginRight: 8 }} />
                <TextInput 
                  style={[styles.input, { flex: 1, paddingHorizontal: 0, backgroundColor: 'transparent' }]} 
                  placeholder="--:-- --"
                  placeholderTextColor="#9CA8B6"
                />
                <Feather name="chevron-down" size={16} color="#7A8C9E" />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DESCRIPCIÓN DE LA FALLA</Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="Describe brevemente el problema..."
              placeholderTextColor="#9CA8B6"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => router.push('/choose-tech' as any)}
          >
            <Text style={styles.continueButtonText}>CONTINUAR</Text>
            <Feather name="chevron-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginTop: 4 },
  
  scrollContainer: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 40 },
  
  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginTop: 15, marginBottom: 20, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  
  input: { backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 15, fontSize: 14, color: '#0A192F', borderWidth: 1, borderColor: '#F0F4F8', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F0F4F8' },
  
  textArea: { backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 15, fontSize: 14, color: '#0A192F', borderWidth: 1, borderColor: '#F0F4F8', minHeight: 100, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  footer: { paddingHorizontal: 25, paddingVertical: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  continueButton: { flexDirection: 'row', backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  continueButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginRight: 10 },
});
