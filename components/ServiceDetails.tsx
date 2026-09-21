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
  KeyboardAvoidingView,
  Alert,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api, useAuth } from './context/AuthContext';

export default function ServiceDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; technicianId?: string }>();
  const { token } = useAuth();
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFolio, setSuccessFolio] = useState<string | null>(null);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });
    if (!result.canceled) setImages(result.assets.slice(0, 5));
  };

  const submitRequest = async () => {
    if (!token) {
      Alert.alert('Sesión requerida', 'Inicia sesión para crear una solicitud.', [{ text: 'Ir al login', onPress: () => router.replace('/' as any) }]);
      return;
    }
    if (!description.trim() || !street.trim()) {
      Alert.alert('Datos incompletos', 'Escribe la descripción y la dirección del servicio.');
      return;
    }

    const form = new FormData();
    form.append('categoria', params.category || 'OTROS');
    form.append('descripcion', description.trim());
    form.append('direccion', `${street.trim()} ${houseNumber.trim()}, ${neighborhood.trim()} CP ${postalCode.trim()}`.trim());
    if (preferredDate.trim()) form.append('fecha_preferida', preferredDate.trim());
    if (preferredTime.trim()) form.append('hora_preferida', preferredTime.trim());
    if (params.technicianId && /^\d+$/.test(params.technicianId)) form.append('id_tecnico', params.technicianId);
    images.forEach((image, index) => {
      form.append('imagenes', { uri: image.uri, name: image.fileName || `problema-${index + 1}.jpg`, type: image.mimeType || 'image/jpeg' } as any);
    });

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/solicitudes', form);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('La solicitud no fue confirmada por el servidor.');
      }
      const request = response.data?.solicitud;
      setSuccessFolio(String(request?.folio || request?.id_solicitud || 'sin folio'));
    } catch (error: any) {
      Alert.alert('No se pudo enviar', error.response?.data?.error || 'Verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  value={street}
                  onChangeText={setStreet}
                  placeholderTextColor="#9CA8B6"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>NÚM. CASA</Text>
              <TextInput 
                style={styles.input} 
                value={houseNumber}
                onChangeText={setHouseNumber}
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
                  value={neighborhood}
                  onChangeText={setNeighborhood}
                  placeholderTextColor="#9CA8B6"
                />
                <Feather name="chevron-down" size={16} color="#7A8C9E" />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CÓDIGO POSTAL</Text>
              <TextInput 
                style={styles.input} 
                value={postalCode}
                onChangeText={setPostalCode}
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
                  value={preferredDate}
                  onChangeText={setPreferredDate}
                  placeholder="AAAA-MM-DD"
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
                  value={preferredTime}
                  onChangeText={setPreferredTime}
                  placeholder="HH:MM"
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
              value={description}
              onChangeText={setDescription}
              placeholder="Describe brevemente el problema..."
              placeholderTextColor="#9CA8B6"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FOTOS DEL PROBLEMA (OPCIONAL)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImages}>
              <Feather name="paperclip" size={16} color="#0A192F" />
              <Text style={styles.photoButtonText}>{images.length ? `${images.length} foto(s) seleccionada(s)` : 'ADJUNTAR FOTOS'}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={submitRequest}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Text style={styles.continueButtonText}>ENVIANDO...</Text> : <>
              <Text style={styles.continueButtonText}>ENVIAR SOLICITUD</Text>
              <Feather name="check" size={16} color="#FFFFFF" />
            </>}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <Modal visible={Boolean(successFolio)} transparent animationType="fade" onRequestClose={() => setSuccessFolio(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Feather name="check" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>¡Solicitud creada exitosamente!</Text>
            <Text style={styles.successFolio}>Folio: {successFolio}</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setSuccessFolio(null);
                router.push('/my-requests' as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Ver mis solicitudes"
            >
              <Text style={styles.successButtonText}>VER MIS SOLICITUDES</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  photoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingVertical: 15 },
  photoButtonText: { color: '#0A192F', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successModal: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 28, alignItems: 'center' },
  successIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2E9B62', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  successTitle: { color: '#0A192F', fontSize: 19, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  successFolio: { color: '#506174', fontSize: 15, marginBottom: 24 },
  successButton: { width: '100%', backgroundColor: '#0A192F', borderRadius: 6, paddingVertical: 16, alignItems: 'center' },
  successButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
});
