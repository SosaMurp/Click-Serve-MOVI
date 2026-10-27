import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { SafeMapWrapper } from './SafeMapWrapper';
import { createServiceRequest } from '../services/requestsApi';
import { useAuth, api } from './context/AuthContext';
import { getCurrentLocation, reverseGeocode, FALLBACK_LOCATION } from '../services/locationService';

const MASTER_EMAILS = ['jesusabar123@gmail.com', 'luisgallo123123@gmail.com', 'jesusabar123123@gmail.com'];

export default function ConfirmService() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    tecnicoId?: string;
    technicianId?: string;
    technicianName?: string;
    tecnicoNombre?: string;
  }>();

  const assignedTechId = params.tecnicoId || params.technicianId || null;
  const assignedTechName = params.technicianName || params.tecnicoNombre || null;
  const category = typeof params.category === 'string' ? params.category.toUpperCase() : 'TECH';

  const [direccion, setDireccion] = useState('Av. Lázaro Cárdenas #123, Col. Centro');
  const [descripcion, setDescripcion] = useState('');
  const [fechaPreferida, setFechaPreferida] = useState('Hoy');
  const [horaPreferida, setHoraPreferida] = useState('Lo antes posible');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Modal States
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  const dateOptions = [
    'Hoy',
    'Mañana',
    'En 2 días',
    'En 3 días',
    'Este fin de semana',
    'Próxima semana'
  ];

  const timeOptions = [
    'Lo antes posible',
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM'
  ];
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>(FALLBACK_LOCATION);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Función para obtener ubicación actual y geocodificación inversa
  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { coords, isFallback } = await getCurrentLocation();
      setLocation(coords);
      const addr = await reverseGeocode(coords);
      setDireccion(addr);
      if (isFallback) {
        Alert.alert(
          'Permiso no concedido',
          'No se pudo acceder al GPS en tiempo real. Se ha establecido la ubicación predeterminada (Lázaro Cárdenas).'
        );
      }
    } catch (err) {
      console.warn('Error al obtener ubicación:', err);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual.');
    } finally {
      setGettingLocation(false);
    }
  };

  useEffect(() => {
    handleUseCurrentLocation();
  }, []);

  const handlePickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso Requerido', 'Se necesita permiso para acceder a la galería.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        setImages(result.assets.slice(0, 5));
      }
    } catch {
      Alert.alert('Error', 'No se pudieron seleccionar las imágenes.');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    const userEmail = String(user?.correo || user?.email || '').trim().toLowerCase();
    const isMasterUser = MASTER_EMAILS.includes(userEmail);
    const estado = String(user?.estado_cuenta || user?.estado || '').trim().toUpperCase();
    const isApproved = estado === 'APROBADO' || estado === 'ACTIVO' || user?.identidad_verificada === true || user?.verificado === true;

    if (!isMasterUser && !isApproved) {
      Alert.alert(
        'Cuenta en Revisión',
        'Tu cuenta se encuentra en revisión de documentos. No puedes solicitar servicios hasta que tus credenciales sean aprobadas.'
      );
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa una breve descripción del servicio que necesitas.');
      return;
    }

    setSubmitting(true);
    try {
      let createdFolio = '';

      if (images.length > 0) {
        // Enviar vía FormData para adjuntar imágenes
        const form = new FormData();
        form.append('categoria', category);
        form.append('descripcion', descripcion.trim());
        form.append('direccion', direccion.trim());
        form.append('fecha_preferida', fechaPreferida);
        form.append('hora_preferida', horaPreferida);
        if (location?.latitude) form.append('latitud', String(location.latitude));
        if (location?.longitude) form.append('longitud', String(location.longitude));
        if (assignedTechId) {
          form.append('id_tecnico', String(assignedTechId));
        }
        images.forEach((img, idx) => {
          form.append('imagenes', {
            uri: img.uri,
            name: img.fileName || `evidencia-${idx + 1}.jpg`,
            type: img.mimeType || 'image/jpeg',
          } as any);
        });

        const res = await api.post('/api/solicitudes', form);
        createdFolio = res.data?.solicitud?.folio || '';
      } else {
        const payload: any = {
          categoria: category,
          descripcion: descripcion.trim(),
          direccion: direccion.trim(),
          fecha_preferida: fechaPreferida,
          hora_preferida: horaPreferida,
          latitud: location.latitude,
          longitud: location.longitude,
        };
        if (assignedTechId) {
          payload.id_tecnico = assignedTechId;
        }
        const created = await createServiceRequest(payload);
        createdFolio = created?.folio || '';
      }

      if (assignedTechId && assignedTechName) {
        Alert.alert(
          'Solicitud enviada',
          `Tu solicitud ha sido enviada directamente a ${assignedTechName}. Te notificaremos en cuanto acepte o cotice tu servicio.`,
          [
            {
              text: 'Ver Mis Solicitudes',
              onPress: () => router.push({ pathname: '/my-requests', params: { showSuccess: 'true' } } as any),
            },
          ]
        );
      } else {
        Alert.alert(
          'Solicitud creada',
          `Tu solicitud para ${category} ha sido publicada. Te redirigiremos a los técnicos disponibles.`,
          [
            {
              text: 'Ver Técnicos',
              onPress: () => router.push({ pathname: '/service-list', params: { category } } as any),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.mensaje || error.response?.data?.error || 'No se pudo crear la solicitud. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Feather name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Solicitud de Servicio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Assigned Technician Banner if applicable */}
          {assignedTechName ? (
            <View style={styles.assignedTechBadge}>
              <Feather name="user-check" size={14} color="#FF6B1A" style={{ marginRight: 6 }} />
              <Text style={styles.assignedTechBadgeText}>TÉCNICO SELECCIONADO: {assignedTechName.toUpperCase()}</Text>
            </View>
          ) : (
            <View style={styles.categoryBadge}>
              <Feather name="tag" size={14} color="#FF6B1A" style={{ marginRight: 6 }} />
              <Text style={styles.categoryBadgeText}>CATEGORÍA: {category}</Text>
            </View>
          )}

          <Text style={styles.title}>Describe tu necesidad</Text>
          <Text style={styles.subtitle}>
            {assignedTechName
              ? `Completa los datos para asignar tu orden directamente a ${assignedTechName}.`
              : 'Completa los datos para publicar tu solicitud en la bolsa de trabajo y conectar con técnicos disponibles.'}
          </Text>

          {/* Input Dirección y botón de GPS */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.inputLabel}>DIRECCIÓN DEL SERVICIO</Text>
              <TouchableOpacity 
                style={styles.gpsButton} 
                onPress={handleUseCurrentLocation}
                disabled={gettingLocation}
                activeOpacity={0.8}
              >
                {gettingLocation ? (
                  <ActivityIndicator size="small" color="#FF6B1A" />
                ) : (
                  <>
                    <Feather name="navigation" size={12} color="#FF6B1A" style={{ marginRight: 4 }} />
                    <Text style={styles.gpsButtonText}>UBICACIÓN ACTUAL</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Feather name="map-pin" size={18} color="#FF6B1A" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Ingresa la dirección del servicio..."
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Mapa Visual de Confirmación de Ubicación */}
          <View style={styles.mapCardContainer}>
            <Text style={[styles.inputLabel, { marginBottom: 8 }]}>CONFIRMAR UBICACIÓN EN MAPA</Text>
            <View style={styles.mapWrapper}>
              <SafeMapWrapper>
                <MapView
                  style={styles.miniMap}
                  region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                >
                  <Marker
                    coordinate={location}
                    title="Ubicación del Servicio"
                    description={direccion}
                    pinColor="#FF6B1A"
                  />
                </MapView>
              </SafeMapWrapper>
              {gettingLocation && (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator color="#FF6B1A" size="small" />
                  <Text style={{ color: '#0F172A', fontSize: 11, fontWeight: '700', marginTop: 6 }}>Detectando coordenadas...</Text>
                </View>
              )}
            </View>
          </View>

          {/* Input Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DESCRIPCIÓN DEL PROBLEMA O REQUERIMIENTO</Text>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
              <Feather name="edit-3" size={18} color="#94A3B8" style={{ marginRight: 10, marginTop: 2 }} />
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Ej. Mi aire acondicionado no enfría y hace ruido..."
                placeholderTextColor="#94A3B8"
                multiline
              />
            </View>
          </View>

          {/* Cita Preferida */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>DÍA ESTIMADO</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setDateModalVisible(true)}
                activeOpacity={0.8}
              >
                <Feather name="calendar" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                <Text style={styles.selectorText}>{fechaPreferida}</Text>
                <Feather name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>HORARIO PREFERIDO</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setTimeModalVisible(true)}
                activeOpacity={0.8}
              >
                <Feather name="clock" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                <Text style={styles.selectorText}>{horaPreferida}</Text>
                <Feather name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Adjuntar Evidencias (Fotos) */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.inputLabel}>EVIDENCIAS DEL PROBLEMA (OPCIONAL)</Text>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>{images.length}/5</Text>
            </View>

            <TouchableOpacity
              style={styles.pickEvidenceBtn}
              onPress={handlePickImages}
              activeOpacity={0.8}
            >
              <Feather name="camera" size={18} color="#FF6B1A" style={{ marginRight: 8 }} />
              <Text style={styles.pickEvidenceBtnText}>
                {images.length > 0 ? 'AGREGAR MÁS FOTOS' : 'ADJUNTAR FOTOS O CAPTURAS'}
              </Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {images.map((img, idx) => (
                  <View key={idx} style={styles.imageThumbnailWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.imageThumbnail} />
                    <TouchableOpacity
                      style={styles.removeImageBadge}
                      onPress={() => handleRemoveImage(idx)}
                      activeOpacity={0.8}
                    >
                      <Feather name="x" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Botón Solicitar */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {assignedTechName ? 'ENVIAR SOLICITUD' : 'CONFIRMAR Y BUSCAR TÉCNICOS'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Selector Día */}
      <Modal visible={dateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecciona un Día</Text>
            <FlatList
              data={dateOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, fechaPreferida === item && styles.optionItemSelected]}
                  onPress={() => {
                    setFechaPreferida(item);
                    setDateModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionText, fechaPreferida === item && styles.optionTextSelected]}>
                    {item}
                  </Text>
                  {fechaPreferida === item && <Feather name="check" size={16} color="#FF6B1A" />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setDateModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Selector Hora */}
      <Modal visible={timeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Horario Preferido</Text>
            <FlatList
              data={timeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, horaPreferida === item && styles.optionItemSelected]}
                  onPress={() => {
                    setHoraPreferida(item);
                    setTimeModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionText, horaPreferida === item && styles.optionTextSelected]}>
                    {item}
                  </Text>
                  {horaPreferida === item && <Feather name="check" size={16} color="#FF6B1A" />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setTimeModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 15, 
    paddingBottom: 15, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  
  categoryBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF7ED', 
    borderWidth: 1, 
    borderColor: '#FFEDD5', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    alignSelf: 'flex-start', 
    marginBottom: 15 
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '800', color: '#FF6B1A', letterSpacing: 0.8 },

  assignedTechBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15
  },
  assignedTechBadgeText: { fontSize: 11, fontWeight: '800', color: '#FF6B1A', letterSpacing: 0.8 },

  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 20 },

  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 6 },
  gpsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  gpsButtonText: { fontSize: 10, fontWeight: '800', color: '#FF6B1A' },

  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    minHeight: 48, 
    backgroundColor: '#F8FAFC' 
  },
  input: { flex: 1, fontSize: 14, color: '#0F172A', paddingVertical: 0 },
  selectorText: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '500' },

  mapCardContainer: { marginBottom: 18 },
  mapWrapper: { flex: 1, width: '100%', minHeight: 220, height: 220, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  miniMap: { flex: 1, width: '100%', minHeight: 220, height: 220 },
  mapLoadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255, 255, 255, 0.85)', justifyContent: 'center', alignItems: 'center' },

  row: { flexDirection: 'row' },

  pickEvidenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    borderStyle: 'dashed',
  },
  pickEvidenceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B1A',
    letterSpacing: 0.5,
  },
  imageThumbnailWrapper: {
    position: 'relative',
    marginRight: 10,
    marginTop: 4,
  },
  imageThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  removeImageBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButton: { 
    flexDirection: 'row', 
    backgroundColor: '#FF6B1A', 
    height: 52, 
    minHeight: 52, 
    paddingHorizontal: 20, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3 
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5, flexShrink: 1, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, width: '100%', maxWidth: 360, elevation: 5 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15, textAlign: 'center' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  optionItemSelected: { backgroundColor: '#FFF7ED' },
  optionText: { fontSize: 14, color: '#0F172A', fontWeight: '500' },
  optionTextSelected: { color: '#FF6B1A', fontWeight: '700' },
  closeModalButton: { marginTop: 15, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  closeModalButtonText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
});
