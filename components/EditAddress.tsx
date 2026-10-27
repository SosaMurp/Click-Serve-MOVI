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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { api } from './context/AuthContext';
import { SafeMapWrapper } from './SafeMapWrapper';
import { getCurrentLocation, reverseGeocode, FALLBACK_LOCATION } from '../services/locationService';

export default function EditAddress() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const addressId = params.id || '1';

  const [etiqueta, setEtiqueta] = useState('Casa');
  const [calle, setCalle] = useState('Av. Lázaro Cárdenas 1520');
  const [interior, setInterior] = useState('48');
  const [cp, setCp] = useState('60950');
  const [saving, setSaving] = useState(false);

  // Ubicación del mapa
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(FALLBACK_LOCATION);
  const [loadingGps, setLoadingGps] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getCurrentLocation();
      setCoords(res.coords);
    })();
  }, []);

  const handleGpsCenter = async () => {
    setLoadingGps(true);
    try {
      const { coords: gpsCoords, isFallback } = await getCurrentLocation();
      setCoords(gpsCoords);

      // Geocodificación inversa
      const [addressObj] = await Location.reverseGeocodeAsync(gpsCoords);
      if (addressObj) {
        if (addressObj.street) {
          const stNum = addressObj.streetNumber ? ` #${addressObj.streetNumber}` : '';
          setCalle(`${addressObj.street}${stNum}`);
        }
        if (addressObj.postalCode) {
          setCp(addressObj.postalCode);
        }
      } else {
        const fullAddr = await reverseGeocode(gpsCoords);
        if (fullAddr) setCalle(fullAddr);
      }

      if (isFallback) {
        Alert.alert('Aviso', 'No se concedieron permisos de GPS. Mostrando ubicación por defecto.');
      }
    } catch (err: any) {
      console.warn('Error al obtener GPS:', err);
    } finally {
      setLoadingGps(false);
    }
  };

  const handleLocationSelect = async (newCoords: { latitude: number; longitude: number }) => {
    setCoords(newCoords);
    try {
      const [addressObj] = await Location.reverseGeocodeAsync(newCoords);
      if (addressObj) {
        if (addressObj.street) {
          const stNum = addressObj.streetNumber ? ` #${addressObj.streetNumber}` : '';
          setCalle(`${addressObj.street}${stNum}`);
        }
        if (addressObj.postalCode) {
          setCp(addressObj.postalCode);
        }
      }
    } catch (err) {
      console.warn('Error en reverse geocode:', err);
    }
  };

  const handleDeleteAddress = () => {
    Alert.alert(
      '¿Eliminar dirección?',
      'Esta acción eliminará la ubicación de tu cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete(`/api/direcciones/${addressId}`);
              if (res && res.status >= 400) {
                throw new Error(res.data?.error || `Error HTTP ${res.status}`);
              }
              Alert.alert('Éxito', 'La dirección se ha eliminado correctamente.', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error de conexión al eliminar la dirección.');
            }
          },
        },
      ]
    );
  };

  const handleSaveAddress = async () => {
    if (!calle.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la calle.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/api/direcciones', {
        etiqueta,
        calle,
        numero: interior,
        interior,
        colonia: 'Centro',
        cp,
        latitud: coords.latitude,
        longitud: coords.longitude,
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
      {/* Header Reorganizado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton} activeOpacity={0.8}>
            <Feather name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Registrar Dirección</Text>
            <Text style={styles.headerSubtitle}>CONFIRMA O AJUSTA TU UBICACIÓN</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleDeleteAddress} activeOpacity={0.8} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Tarjeta con Mini-Mapa Interactivo OpenStreetMap */}
          <View style={styles.mapCard}>
            <View style={styles.mapCardHeader}>
              <Feather name="map-pin" size={16} color="#FF6B1A" style={{ marginRight: 6 }} />
              <Text style={styles.mapCardTitle}>UBICACIÓN EN MAPA (OPENSTREETMAP)</Text>
            </View>

            <View style={styles.mapContainer}>
              <SafeMapWrapper
                height={200}
                latitude={coords.latitude}
                longitude={coords.longitude}
                fallbackTitle="Mini-Mapa de Ubicación"
                fallbackSubtitle="Toca en el mapa para ajustar el punto exacto."
                interactive={true}
                onLocationSelect={handleLocationSelect}
                markers={[
                  {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    title: 'Ubicación seleccionada',
                    description: calle,
                    color: '#FF6B1A',
                  },
                ]}
              />
            </View>

            {/* Espaciador y Botón Prominente para Usar Ubicación Actual */}
            <TouchableOpacity 
              style={[styles.useLocationButton, loadingGps && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleGpsCenter}
              disabled={loadingGps}
            >
              {loadingGps ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="crosshair" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.useLocationButtonText}>USAR MI UBICACIÓN ACTUAL</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ETIQUETA</Text>
              <TextInput 
                style={styles.input} 
                value={etiqueta}
                onChangeText={setEtiqueta}
                placeholder="Ej. Casa, Trabajo, Oficina"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CALLE Y NÚMERO</Text>
              <TextInput 
                style={styles.input} 
                value={calle}
                onChangeText={setCalle}
                placeholder="Calle y número exterior"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 14 }]}>
                <Text style={styles.label}>INTERIOR / DEPTO</Text>
                <TextInput 
                  style={styles.input} 
                  value={interior}
                  onChangeText={setInterior}
                  placeholder="Ej. 4B"
                  placeholderTextColor="#94A3B8"
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
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>

        </ScrollView>
        
        {/* Botón Guardar / Actualizar */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.updateButton, saving && { opacity: 0.7 }]} 
            onPress={handleSaveAddress}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>GUARDAR / ACTUALIZAR DIRECCIÓN</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 18, 
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  closeButton: { padding: 4, marginRight: 12 },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0F172A', 
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' 
  },
  headerSubtitle: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#64748B', 
    letterSpacing: 1, 
    marginTop: 2,
    lineHeight: 14,
  },
  deleteButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#FEF2F2', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  
  scrollContainer: { padding: 18 },

  /* Tarjeta con Mini Mapa */
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  mapCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mapCardTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748B', 
    letterSpacing: 1.2,
    lineHeight: 16,
  },
  mapContainer: { 
    height: 200, 
    borderRadius: 16, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    backgroundColor: '#F8FAFC',
    marginBottom: 16
  },

  /* Botón Ancho y Prominente */
  useLocationButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B1A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3
  },
  useLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 18,
  },

  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  inputGroup: { marginBottom: 16 },
  label: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#94A3B8', 
    letterSpacing: 1.5, 
    marginBottom: 8, 
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  input: { 
    fontSize: 14, 
    color: '#0F172A', 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 12,
    fontWeight: '600'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    backgroundColor: '#FFFFFF' 
  },
  updateButton: { 
    backgroundColor: '#0F172A', 
    paddingVertical: 14, 
    paddingHorizontal: 16,
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  updateButtonText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '800', 
    letterSpacing: 1.5,
    lineHeight: 18,
  },
});
