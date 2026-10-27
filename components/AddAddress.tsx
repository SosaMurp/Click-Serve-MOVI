import React, { useState } from 'react';
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
import { api } from './context/AuthContext';

export default function AddAddress() {
  const router = useRouter();

  const [etiqueta, setEtiqueta] = useState('Casa');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [interior, setInterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [cp, setCp] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveAddress = async () => {
    if (!calle.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la calle.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/api/direcciones', {
        etiqueta: etiqueta.trim() || 'Casa',
        calle: calle.trim(),
        numero: numero.trim(),
        interior: interior.trim(),
        colonia: colonia.trim() || 'Centro',
        cp: cp.trim(),
      });

      if (res && res.status >= 400) {
        throw new Error(res.data?.error || `Error HTTP ${res.status}`);
      }

      Alert.alert('Éxito', 'Dirección guardada correctamente.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de conexión al guardar la dirección.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Feather name="x" size={24} color="#0A192F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agregar Ubicación</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Map Area Placeholder */}
          <View style={styles.mapArea}>
            <View style={styles.mapMarkerContainer}>
              <View style={styles.mapMarkerBadge}>
                <Text style={styles.mapMarkerText}>NUEVA UBICACIÓN</Text>
              </View>
              <Feather name="map-pin" size={32} color="#0A192F" />
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ETIQUETA</Text>
              <TextInput 
                style={styles.input} 
                value={etiqueta}
                onChangeText={setEtiqueta}
                placeholder="Ej. Casa, Oficina"
                placeholderTextColor="#C4CDD5"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CALLE</Text>
              <TextInput 
                style={styles.input} 
                value={calle}
                onChangeText={setCalle}
                placeholder="Nombre de la calle"
                placeholderTextColor="#C4CDD5"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.label}>NÚMERO EXT.</Text>
                <TextInput 
                  style={styles.input} 
                  value={numero}
                  onChangeText={setNumero}
                  placeholder="Ej. 123"
                  placeholderTextColor="#C4CDD5"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>NÚMERO INT. / DEPTO</Text>
                <TextInput 
                  style={styles.input} 
                  value={interior}
                  onChangeText={setInterior}
                  placeholder="Ej. 4B"
                  placeholderTextColor="#C4CDD5"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.label}>COLONIA</Text>
                <TextInput 
                  style={styles.input} 
                  value={colonia}
                  onChangeText={setColonia}
                  placeholder="Ej. Centro"
                  placeholderTextColor="#C4CDD5"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>C.P.</Text>
                <TextInput 
                  style={styles.input} 
                  value={cp}
                  onChangeText={setCp}
                  keyboardType="numeric"
                  placeholder="Código Postal"
                  placeholderTextColor="#C4CDD5"
                />
              </View>
            </View>
          </View>

        </ScrollView>
        
        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && { opacity: 0.7 }]} 
            onPress={handleSaveAddress}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>GUARDAR UBICACIÓN</Text>
            )}
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
  scrollContainer: { paddingBottom: 20 },
  mapArea: { height: 180, backgroundColor: '#E1E8ED', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mapMarkerContainer: { alignItems: 'center' },
  mapMarkerBadge: { backgroundColor: '#0A192F', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 5 },
  mapMarkerText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  formContainer: { padding: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { fontSize: 16, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: { paddingHorizontal: 25, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F0F4F8', backgroundColor: '#FFFFFF' },
  saveButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
