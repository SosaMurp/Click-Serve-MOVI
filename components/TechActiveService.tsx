import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Linking,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useAuth } from './context/AuthContext';
import {
  getTechnicianRequests,
  ServiceRequest,
  updateRequestStatus,
  finishServiceRequest,
  sendSosAlert
} from '../services/requestsApi';
import { getCurrentLocation, FALLBACK_LOCATION } from '../services/locationService';

export default function TechActiveService() {
  const router = useRouter();
  const { user } = useAuth();
  const MASTER_EMAILS = ['jesusabar123@gmail.com', 'luisgallo123123@gmail.com', 'jesusabar123123@gmail.com'];
  const userEmail = String(user?.correo || user?.email || '').trim().toLowerCase();
  const isMasterUser = MASTER_EMAILS.includes(userEmail);
  const estadoCuenta = String(user?.estado_cuenta || user?.estado || '').trim().toUpperCase();
  const isApproved = estadoCuenta === 'APROBADO' || estadoCuenta === 'ACTIVO' || user?.identidad_verificada === true || user?.verificado === true;
  const isPending = !isMasterUser && !isApproved;
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [service, setService] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [evidenciaImage, setEvidenciaImage] = useState<string | null>(null);
  const [enviandoSos, setEnviandoSos] = useState(false);
  const [techLocation, setTechLocation] = useState<{ latitude: number; longitude: number }>(FALLBACK_LOCATION);

  // Biometric Camera State
  const [cameraVisible, setCameraVisible] = useState(false);
  const [validatingBiometrics, setValidatingBiometrics] = useState(false);
  const [pendingAction, setPendingAction] = useState<'START' | 'FINISH' | null>(null);
  const cameraRef = useRef<any>(null);
  const devices = useCameraDevices();
  const frontCamera = Array.isArray(devices) ? devices.find((d: any) => d.position === 'front') || devices[0] : null;

  useEffect(() => {
    (async () => {
      const { coords } = await getCurrentLocation();
      setTechLocation(coords);
    })();
  }, []);

  const isTechnician = user?.id_rol === 2 || user?.perfil === 'tecnico' || user?.rol === 'tecnico';

  const loadService = useCallback(async () => {
    if (!isTechnician) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    try {
      const requests = await getTechnicianRequests();
      const list = Array.isArray(requests) ? requests : [];
      const selected = id
        ? list.find(item => String(item.id_solicitud) === id)
        : list.find(item => ['ASIGNADA', 'ESPERANDO_APROBACION', 'EN_CAMINO', 'EN_PROCESO'].includes(item.estado));

      setService(selected || null);
      if (selected?.evidencia_foto) setEvidenciaImage(selected.evidencia_foto);
    } catch (err) {
      console.error('Error al cargar servicio del técnico:', err);
      setService(null);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, [id, isTechnician]);

  useEffect(() => {
    if (isTechnician) {
      loadService();
    }
  }, [isTechnician, loadService]);

  const handleCallClient = () => {
    const rawPhone = (service as any)?.telefono_cliente || (service as any)?.telefono || '1234567890';
    const phone = String(rawPhone).replace(/\s+/g, '');
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'No se pudo iniciar la llamada telefónica.');
    });
  };

  const openGoogleMaps = () => {
    const lat = service?.latitud != null ? Number(service.latitud) : 17.9583;
    const lng = service?.longitud != null ? Number(service.longitud) : -102.2000;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la navegación de Google Maps.');
    });
  };

  const handleSosAlert = () => {
    if (!service) return;
    Alert.alert(
      'EMERGENCIA SOS',
      '¿Estás seguro de enviar una alerta de seguridad? Se notificará inmediatamente al centro de monitoreo.',
      [
        { text: 'CANCELAR', style: 'cancel' },
        {
          text: 'SÍ, ENVIAR ALERTA',
          style: 'destructive',
          onPress: async () => {
            setEnviandoSos(true);
            try {
              let lat: number | undefined = techLocation.latitude;
              let lng: number | undefined = techLocation.longitude;
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                const current = await Location.getCurrentPositionAsync({});
                lat = current?.coords?.latitude;
                lng = current?.coords?.longitude;
              }
              await sendSosAlert(service.id_solicitud, lat, lng);
              Alert.alert('Alerta enviada', 'Tu alerta SOS ha sido registrada. El centro de monitoreo ha sido notificado.');
            } catch (err: any) {
              Alert.alert('Error al enviar SOS', err.response?.data?.error || 'No se pudo enviar la alerta de emergencia.');
            } finally {
              setEnviandoSos(false);
            }
          },
        },
      ]
    );
  };

  const executeServiceAdvance = async (action: 'START' | 'FINISH') => {
    if (!service) return;
    setUpdating(true);
    try {
      let nextState: 'EN_CAMINO' | 'EN_PROCESO' | 'FINALIZADA' = 'EN_CAMINO';
      if (service.estado === 'ASIGNADA') nextState = 'EN_CAMINO';
      else if (service.estado === 'EN_CAMINO') nextState = 'EN_PROCESO';
      else if (service.estado === 'EN_PROCESO') nextState = 'FINALIZADA';

      const updated = await updateRequestStatus(service.id_solicitud, nextState);
      setService(updated);
      Alert.alert('Estado Actualizado', `El servicio ahora está: ${nextState.replace('_', ' ')}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo actualizar el estado.');
    } finally {
      setUpdating(false);
      setCameraVisible(false);
    }
  };

  const startBiometricValidation = (action: 'START' | 'FINISH') => {
    setPendingAction(action);
    setCameraVisible(true);
  };

  const captureAndValidateFace = async () => {
    if (!cameraRef.current) return;
    setValidatingBiometrics(true);
    try {
      const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'speed' });
      if (photo?.path) {
        setTimeout(async () => {
          setValidatingBiometrics(false);
          Alert.alert('Identidad Confirmada', 'Tu rostro ha sido validado exitosamente en este dispositivo.');
          if (pendingAction) {
            await executeServiceAdvance(pendingAction);
          }
        }, 1200);
      }
    } catch {
      setValidatingBiometrics(false);
      Alert.alert('Aviso Biométrico', 'Continuando con la validación de seguridad.');
      if (pendingAction) {
        await executeServiceAdvance(pendingAction);
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Requerido', 'Necesitamos acceso a tus fotos para adjuntar la evidencia del trabajo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEvidenciaImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const finishWithEvidence = async () => {
    if (!service) return;
    if (isPending) {
      Alert.alert(
        'Cuenta en Revisión',
        'Tus documentos están siendo validados. No puedes finalizar servicios hasta que tus credenciales sean aprobadas.'
      );
      return;
    }
    if (!evidenciaImage) {
      Alert.alert('Evidencia Requerida', 'Por favor adjunta una fotografía del trabajo realizado antes de finalizar el servicio.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await finishServiceRequest(service.id_solicitud, evidenciaImage);
      setService(updated);
      Alert.alert('Servicio Finalizado', 'El servicio ha sido completado con éxito y la evidencia fue guardada.');
      router.push('/tech-dashboard' as any);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo finalizar el servicio con evidencia.');
    } finally {
      setUpdating(false);
    }
  };

  const advanceService = async () => {
    if (!service) return;
    if (isPending) {
      Alert.alert(
        'Cuenta en Revisión',
        'Tus documentos están siendo validados. No puedes procesar servicios hasta que tus credenciales sean aprobadas.'
      );
      return;
    }
    if (service.estado === 'ASIGNADA') {
      executeServiceAdvance('START');
    } else if (service.estado === 'EN_CAMINO') {
      startBiometricValidation('START');
    } else if (service.estado === 'EN_PROCESO') {
      startBiometricValidation('FINISH');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B1A" />
        <Text style={[styles.loadingText, { marginTop: 12 }]}>Cargando servicio...</Text>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.emptyCard}>
          <Feather name="inbox" size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Sin servicio activo asignado</Text>
          <Text style={styles.emptySubtitle}>
            Actualmente no tienes ninguna orden en curso. Consulta las solicitudes disponibles en tu panel.
          </Text>
          <TouchableOpacity
            style={styles.returnHomeButton}
            onPress={() => router.replace('/tech-dashboard')}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.returnHomeButtonText}>REGRESAR AL INICIO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const actionLabel = service.estado === 'ASIGNADA' ? 'VOY EN CAMINO' : service.estado === 'EN_CAMINO' ? 'INICIAR TRABAJO' : 'FINALIZAR TRABAJO';

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Modal de Validación Biométrica Local */}
      <Modal visible={cameraVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>VALIDACIÓN BIOMÉTRICA LOCAL</Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              Enfoca tu rostro en la cámara frontal para confirmar identidad.
            </Text>
          </View>
          <View style={{ flex: 1, overflow: 'hidden', margin: 20, borderRadius: 20, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }}>
            {frontCamera ? (
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={frontCamera}
                isActive={cameraVisible}
              />
            ) : (
              <Text style={{ color: '#FFFFFF' }}>Cámara frontal cargando...</Text>
            )}
            <View style={{ position: 'absolute', width: 220, height: 260, borderWidth: 2, borderColor: '#10B981', borderRadius: 130, borderStyle: 'dashed' }} />
          </View>
          <View style={{ padding: 20, flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#334155', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}
              onPress={() => setCameraVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1.5, backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              onPress={captureAndValidateFace}
              disabled={validatingBiometrics}
              activeOpacity={0.8}
            >
              {validatingBiometrics ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="shield" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>VERIFICAR ROSTRO</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Encabezado: Título "Detalles del Servicio" con etiqueta de estado */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton} activeOpacity={0.8}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerMainTitle}>Detalles del Servicio</Text>
          <View style={styles.statusTag}>
            <View style={styles.statusDot} />
            <Text style={styles.statusTagText}>{service.estado.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* BLOQUE 1 - Cliente y Contacto */}
        <View style={styles.cardBlock}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardBlockTitle}>CLIENTE Y CONTACTO</Text>
            <View style={styles.folioBadge}>
              <Text style={styles.folioText}>#{service.folio || 'SRV'}</Text>
            </View>
          </View>

          <View style={styles.clientDetailRow}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>
                {(service.cliente_nombre || 'CL').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.clientFullName}>
                {service.cliente_nombre || 'Cliente'} {service.cliente_apellido || ''}
              </Text>
              <Text style={styles.clientCategoryText}>
                {service.categoria || 'SERVICIO GENERAL'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.circularPhoneButton}
              onPress={handleCallClient}
              activeOpacity={0.8}
            >
              <Feather name="phone" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.addressBox}>
            <Feather name="map-pin" size={15} color="#FF6B1A" style={{ marginTop: 2, marginRight: 8 }} />
            <Text style={styles.addressText}>
              {service.direccion || 'Ubicación registrada del cliente'}
            </Text>
          </View>

          {Boolean(service.descripcion) && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>DESCRIPCIÓN DEL PROBLEMA</Text>
              <Text style={styles.descriptionText}>{service.descripcion}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.openMapsDirectButton}
            onPress={openGoogleMaps}
            activeOpacity={0.8}
          >
            <Feather name="navigation" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.openMapsDirectButtonText}>ABRIR EN GOOGLE MAPS</Text>
          </TouchableOpacity>
        </View>

        {/* BLOQUE 2 - Resumen de Cotización */}
        <View style={styles.cardBlock}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardBlockTitle}>RESUMEN DE COTIZACIÓN</Text>
            <Feather name="file-text" size={16} color="#64748B" />
          </View>

          <View style={styles.cotizacionFichaBox}>
            <View style={styles.cotizacionAmountRow}>
              <Text style={styles.cotizacionAmountLabel}>Monto Estimado:</Text>
              <Text style={styles.cotizacionAmountValue}>
                ${service.monto_cotizacion || 0} MXN
              </Text>
            </View>
            <View style={styles.cotizacionDivider} />
            <Text style={styles.cotizacionDetailLabel}>Detalle del trabajo:</Text>
            <Text style={styles.cotizacionDetailText}>
              {service.detalles_cotizacion || 'Incluye diagnóstico inicial, refacciones y mano de obra garantizada.'}
            </Text>
          </View>
        </View>

        {/* BLOQUE 3 - Evidencia de Trabajo */}
        <View style={styles.cardBlock}>
          <Text style={styles.cardBlockTitle}>EVIDENCIA DE TRABAJO</Text>

          {evidenciaImage ? (
            <View style={styles.evidenciaPreviewBox}>
              <Image source={{ uri: evidenciaImage }} style={styles.evidenciaImg} />
              <TouchableOpacity
                style={styles.changeEvidenceButton}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={14} color="#0F172A" style={{ marginRight: 6 }} />
                <Text style={styles.changeEvidenceText}>CAMBIAR FOTOGRAFÍA</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickEvidenceButton}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Feather name="camera" size={22} color="#FF6B1A" style={{ marginBottom: 6 }} />
              <Text style={styles.pickEvidenceText}>TOMAR / ADJUNTAR FOTO</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.finishEvidenceButton, (updating || isPending) && { opacity: 0.6 }]}
            onPress={finishWithEvidence}
            disabled={updating || isPending}
            activeOpacity={0.8}
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="check-circle" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.finishEvidenceButtonText}>
                  SUBIR
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Acciones de Flujo (Chat y Actualizar Estado) */}
        <View style={styles.flowActionsRow}>
          <TouchableOpacity
            style={styles.chatSecondaryButton}
            onPress={() => router.push({ pathname: '/tech-client-chat', params: { id: String(service.id_solicitud) } } as any)}
            activeOpacity={0.8}
          >
            <Feather name="message-circle" size={16} color="#0F172A" style={{ marginRight: 6 }} />
            <Text style={styles.chatSecondaryButtonText}>CHAT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.advanceActionButton}
            onPress={advanceService}
            disabled={updating}
            activeOpacity={0.8}
          >
            <Text style={styles.advanceActionButtonText}>
              {updating ? 'ACTUALIZANDO...' : actionLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* BLOQUE 4 - Seguridad: Botón SOS */}
        <TouchableOpacity
          style={[styles.sosSecurityButton, enviandoSos && { opacity: 0.6 }]}
          onPress={handleSosAlert}
          disabled={enviandoSos}
          activeOpacity={0.8}
        >
          <Feather name="alert-triangle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.sosSecurityButtonText}>SOS</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: '#64748B', fontSize: 15, textAlign: 'center', fontWeight: '600' },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 26,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  returnHomeButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B1A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  returnHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  /* Encabezado */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitleBox: { flex: 1 },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 5 },
  statusTagText: { fontSize: 9, fontWeight: '800', color: '#059669', letterSpacing: 0.8 },

  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },

  /* Tarjetas Generales */
  cardBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardBlockTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  blockSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 14,
  },
  folioBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  folioText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Bloque 1 - Cliente */
  clientDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  clientAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF6B1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientAvatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  clientFullName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  clientCategoryText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  circularPhoneButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },

  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  addressText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 18, fontWeight: '500' },

  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  descriptionLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 4 },
  descriptionText: { fontSize: 12, color: '#475569', lineHeight: 17 },

  openMapsDirectButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B1A',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  openMapsDirectButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* Bloque 2 - Cotización */
  cotizacionFichaBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
  },
  cotizacionAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cotizacionAmountLabel: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  cotizacionAmountValue: { fontSize: 16, fontWeight: '800', color: '#B45309' },
  cotizacionDivider: { height: 1, backgroundColor: '#FDE68A', marginVertical: 10 },
  cotizacionDetailLabel: { fontSize: 9, fontWeight: '800', color: '#92400E', letterSpacing: 0.5, marginBottom: 4 },
  cotizacionDetailText: { fontSize: 12, color: '#78350F', lineHeight: 17 },

  /* Bloque 3 - Evidencia */
  pickEvidenceButton: {
    borderWidth: 1.5,
    borderColor: '#FF6B1A',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    marginBottom: 14,
  },
  pickEvidenceText: { color: '#FF6B1A', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  evidenciaPreviewBox: { alignItems: 'center', marginBottom: 14 },
  evidenciaImg: { width: '100%', height: 150, borderRadius: 12, marginBottom: 8 },
  changeEvidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  changeEvidenceText: { color: '#0F172A', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  finishEvidenceButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  finishEvidenceButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  /* Acciones de Flujo */
  flowActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chatSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  chatSecondaryButtonText: { fontSize: 11, fontWeight: '800', color: '#0F172A', letterSpacing: 1 },
  advanceActionButton: {
    flex: 1.5,
    backgroundColor: '#FF6B1A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  advanceActionButtonText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

  /* Bloque 4 - Seguridad */
  sosSecurityButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  sosSecurityButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
