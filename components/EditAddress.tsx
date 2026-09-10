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

export default function EditAddress() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Feather name="x" size={24} color="#0A192F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Ubicación</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.deleteText}>ELIMINAR</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Map Area */}
          <View style={styles.mapArea}>
            <View style={styles.mapMarkerContainer}>
              <View style={styles.mapMarkerBadge}>
                <Text style={styles.mapMarkerText}>TÚ ESTÁS AQUÍ</Text>
              </View>
              <Feather name="map-pin" size={32} color="#0A192F" />
            </View>
            <TouchableOpacity style={styles.targetButton}>
              <Feather name="crosshair" size={18} color="#0A192F" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ETIQUETA</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="Casa"
                placeholderTextColor="#C4CDD5"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CALLE Y NÚMERO</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="Av. Lázaro Cárdenas 1520"
                placeholderTextColor="#C4CDD5"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.label}>INTERIOR / DEPTO</Text>
                <TextInput 
                  style={styles.input} 
                  defaultValue="48"
                  placeholderTextColor="#C4CDD5"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>C.P.</Text>
                <TextInput 
                  style={styles.input} 
                  defaultValue="60950"
                  keyboardType="numeric"
                  placeholderTextColor="#C4CDD5"
                />
              </View>
            </View>
          </View>

        </ScrollView>
        
        {/* Update Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.updateButton} onPress={() => router.back()}>
            <Text style={styles.updateButtonText}>ACTUALIZAR DIRECCIÓN</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  closeButton: { padding: 5, marginLeft: -5, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  deleteText: { fontSize: 9, fontWeight: '800', color: '#FF6B6B', letterSpacing: 1 },
  scrollContainer: { paddingBottom: 20 },
  mapArea: { height: 250, backgroundColor: '#E1E8ED', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mapMarkerContainer: { alignItems: 'center', marginTop: -20 },
  mapMarkerBadge: { backgroundColor: '#0A192F', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 5 },
  mapMarkerText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  targetButton: { position: 'absolute', bottom: 15, right: 15, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  formContainer: { padding: 25 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { fontSize: 16, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: { paddingHorizontal: 25, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F0F4F8', backgroundColor: '#FFFFFF' },
  updateButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center' },
  updateButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
