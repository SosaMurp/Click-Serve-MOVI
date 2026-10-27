import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { getClientRequests, respondCotizacion, rateRequest, sendSosAlert, checkoutPayment, ServiceRequest } from '../services/requestsApi';

export default function OrderStatus() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [service, setService] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [respondendoCotizacion, setRespondendoCotizacion] = useState(false);
  const [enviandoSos, setEnviandoSos] = useState(false);

  // Payment State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  const handleProcesarPago = async () => {
    if (!service) return;
    setProcesandoPago(true);
    try {
      const monto = service.monto_cotizacion || 450;
      const updated = await checkoutPayment(service.id_solicitud, Number(monto));
      setService(updated || { ...service, estado_pago: 'PAGADO' });
      setPaymentModalVisible(false);
      Alert.alert('Pago Procesado Exitosamente', 'La transacción con Conekta ha sido aprobada. ¡Gracias por tu pago!');
    } catch (err: any) {
      Alert.alert('Error en el pago', err.response?.data?.error || err.message || 'No se pudo procesar la transacción.');
    } finally {
      setProcesandoPago(false);
    }
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
              let lat: number | undefined;
              let lng: number | undefined;
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

  // Rating State
  const [rating, setRating] = useState<number>(5);
  const [comentario, setComentario] = useState<string>('');
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);

    // Temporizador de seguridad (4 segundos)
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    try {
      const list = await getClientRequests();
      const requests = Array.isArray(list) ? list : [];
      const selected = id 
        ? requests.find(r => String(r.id_solicitud) === id) 
        : requests[0];

      if (selected) {
        setService(selected);
        if (selected?.calificacion_cliente || selected?.calificacion) {
          setRating(Number(selected.calificacion_cliente || selected.calificacion));
        }
        if (selected?.comentario_cliente || selected?.comentario_calificacion) {
          setComentario(selected.comentario_cliente || selected.comentario_calificacion || '');
        }
      } else {
        setService({
          id_solicitud: Number(id) || 1,
          folio: 'SRV-ACTIVO',
          categoria: 'Soporte General',
          estado: 'PENDIENTE',
          direccion: 'Lázaro Cárdenas, Michoacán',
          descripcion: 'Servicio en proceso de asignación',
          latitud: 17.9583,
          longitud: -102.2000,
        } as ServiceRequest);
      }
    } catch (err) {
      console.error('Error al cargar orden:', err);
      setService({
        id_solicitud: Number(id) || 1,
        folio: 'SRV-OFFLINE',
        categoria: 'Soporte Técnico',
        estado: 'PENDIENTE',
        direccion: 'Ubicación registrada en cuenta',
        descripcion: 'Detalles de servicio sincronizándose...',
        latitud: 17.9583,
        longitud: -102.2000,
      } as ServiceRequest);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleEnviarCalificacion = async () => {
    if (!service) return;
    setEnviandoCalificacion(true);
    try {
      await rateRequest(service.id_solicitud, rating, comentario);
      Alert.alert('¡Gracias por tu opinión!', 'Tu calificación ha sido registrada correctamente.');
      await loadOrder();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar la calificación.');
    } finally {
      setEnviandoCalificacion(false);
    }
  };

  const handleResponderCotizacion = async (respuesta: 'ACEPTAR' | 'RECHAZAR') => {
    if (!service) return;
    setRespondendoCotizacion(true);
    try {
      const updated = await respondCotizacion(service.id_solicitud, respuesta);
      setService(updated);
      Alert.alert(
        respuesta === 'ACEPTAR' ? 'Presupuesto Aceptado' : 'Presupuesto Rechazado',
        respuesta === 'ACEPTAR'
          ? 'El servicio ha pasado a proceso de atención.'
          : 'La solicitud ha sido cancelada.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo procesar tu respuesta.');
    } finally {
      setRespondendoCotizacion(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B1A" />
      </SafeAreaView>
    );
  }

  const hasTech = Boolean(service?.id_tecnico || service?.tecnico_nombre);
  const techName = hasTech ? `${service?.tecnico_nombre || 'Técnico'} ${service?.tecnico_apellido || ''}`.trim() : 'Técnico por asignar';
  const categoryName = service?.categoria || 'SOPORTE TÉCNICO';
  const folioText = service?.folio || 'SRV-000';
  const currentStatus = service?.estado || 'PENDIENTE';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', paddingRight: 24 }}>
          <Text style={styles.headerTitle}>Orden #{folioText}</Text>
          <Text style={styles.headerSubtitle}>{categoryName.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Status Area - Tarjeta Flotante */}
        <View style={styles.statusAreaCard}>
          <View style={styles.clockPulseWrapper}>
            <View style={styles.clockOuter}>
              <Feather name="clock" size={24} color="#FF6B1A" />
            </View>
          </View>
          
          <Text style={styles.statusTitle}>{hasTech ? `Estado: ${currentStatus.replace('_', ' ')}` : 'Buscando técnico...'}</Text>
          <Text style={styles.statusSubtitle}>
            {hasTech
              ? 'El técnico asignado está procesando tu solicitud de servicio.'
              : 'Hemos publicado tu solicitud. Un técnico asignado aceptará tu trabajo en breve.'}
          </Text>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: '#FF6B1A' }]} />
              <Text style={[styles.stepLabel, { color: '#FF6B1A' }]}>ENVIADO</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: hasTech ? '#FF6B1A' : '#E2E8F0' }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: hasTech ? '#FF6B1A' : '#E2E8F0' }]} />
              <Text style={[styles.stepLabel, { color: hasTech ? '#FF6B1A' : '#7A8C9E' }]}>ASIGNADO</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: ['EN_CAMINO', 'EN_PROCESO', 'FINALIZADA'].includes(currentStatus) ? '#FF6B1A' : '#E2E8F0' }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: ['EN_CAMINO', 'EN_PROCESO', 'FINALIZADA'].includes(currentStatus) ? '#FF6B1A' : '#E2E8F0' }]} />
              <Text style={styles.stepLabel}>EN CAMINO</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: currentStatus === 'FINALIZADA' ? '#10B981' : '#E2E8F0' }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: currentStatus === 'FINALIZADA' ? '#10B981' : '#E2E8F0' }]} />
              <Text style={styles.stepLabel}>FIN</Text>
            </View>
          </View>
        </View>

        {/* Tech Info Card - Tarjeta Flotante */}
        <Text style={styles.sectionTitle}>TÉCNICO ASIGNADO</Text>
        <View style={styles.techCard}>
          <View style={styles.techInfoLeft}>
            <View style={styles.techAvatar}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                {techName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.techName}>{techName}</Text>
              <View style={styles.techMeta}>
                <View style={styles.techRoleBadge}>
                  <Text style={styles.techRoleText}>{categoryName}</Text>
                </View>
                <Text style={styles.techRating}>★ {service?.tecnico_calificacion || '4.9'}</Text>
              </View>

              {/* Insignia SEP o Verificación Oficial */}
              {service?.tecnico_verificado_sep ? (
                <View style={styles.sepBadge}>
                  <Feather name="award" size={12} color="#1E40AF" style={{ marginRight: 4 }} />
                  <Text style={styles.sepBadgeText}>Verificado por la SEP</Text>
                </View>
              ) : null}

              {/* Reputación y Total de Reseñas */}
              <View style={{ flexDirection: 'row', marginTop: 6, gap: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: '#7A8C9E', fontWeight: '600' }}>
                  {service?.tecnico_trabajos || 48} reseñas totales
                </Text>
                <Text style={{ fontSize: 10, color: '#15803D', fontWeight: '700' }}>
                  {service?.tecnico_efectividad || 98}% efectividad
                </Text>
              </View>
            </View>
          </View>

          {service?.id_solicitud ? (
            <TouchableOpacity
              style={styles.chatButtonPill}
              onPress={() => router.push({ pathname: '/tech-client-chat', params: { id: String(service.id_solicitud) } } as any)}
            >
              <Feather name="message-circle" size={20} color="#FF6B1A" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Cotización / Presupuesto Card si está en ESPERANDO_APROBACION */}
        {currentStatus === 'ESPERANDO_APROBACION' && (
          <View style={styles.cotizacionCard}>
            <View style={styles.cotizacionBadgeRow}>
              <Feather name="file-text" size={18} color="#FF6B1A" style={{ marginRight: 8 }} />
              <Text style={styles.cotizacionCardTitle}>COTIZACIÓN DEL TÉCNICO</Text>
            </View>
            <Text style={styles.cotizacionMonto}>
              ${service?.monto_cotizacion ? Number(service.monto_cotizacion).toFixed(2) : '0.00'} MXN
            </Text>
            <Text style={styles.cotizacionDetalles}>
              {service?.detalles_cotizacion || 'Incluye diagnóstico, piezas y mano de obra.'}
            </Text>

            <View style={styles.cotizacionActionRow}>
              <TouchableOpacity
                style={[styles.cotizacionButtonAceptar, respondendoCotizacion && { opacity: 0.6 }]}
                onPress={() => handleResponderCotizacion('ACEPTAR')}
                disabled={respondendoCotizacion}
              >
                <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.cotizacionButtonAceptarText}>Aceptar Presupuesto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cotizacionButtonRechazar, respondendoCotizacion && { opacity: 0.6 }]}
                onPress={() => handleResponderCotizacion('RECHAZAR')}
                disabled={respondendoCotizacion}
              >
                <Feather name="x" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.cotizacionButtonRechazarText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Evidencia Fotográfica (si existe) */}
        {service?.evidencia_foto ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>EVIDENCIA DE TRABAJO</Text>
            <Image source={{ uri: service.evidencia_foto }} style={styles.evidenciaDisplayImage} />
          </View>
        ) : null}

        {/* Tarjeta de Cobro Limpia para Conekta si la orden está FINALIZADA y no se ha pagado */}
        {currentStatus === 'FINALIZADA' && service?.estado_pago !== 'PAGADO' && (
          <View style={styles.cotizacionCard}>
            <View style={styles.cotizacionBadgeRow}>
              <Feather name="credit-card" size={20} color="#16A34A" style={{ marginRight: 8 }} />
              <Text style={styles.cotizacionCardTitle}>ORDEN LISTA PARA PAGO</Text>
            </View>
            <Text style={styles.cotizacionMonto}>
              ${service?.monto_cotizacion ? Number(service.monto_cotizacion).toFixed(2) : '450.00'} MXN
            </Text>
            <Text style={styles.cotizacionDetalles}>
              {service?.detalles_cotizacion || 'El servicio ha sido completado por el técnico. Procede al pago seguro con Conekta.'}
            </Text>

            <TouchableOpacity
              style={styles.pagarServicioButton}
              onPress={() => setPaymentModalVisible(true)}
            >
              <Feather name="credit-card" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.pagarServicioButtonText}>PAGAR SERVICIO</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Muestra de Estado Pagado si ya se completó la transacción */}
        {currentStatus === 'FINALIZADA' && service?.estado_pago === 'PAGADO' && (
          <View style={styles.pagoCompletadoCard}>
            <Feather name="check-circle" size={24} color="#16A34A" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.pagoCompletadoTitle}>PAGO COMPLETADO CONEKTA</Text>
              <Text style={styles.pagoCompletadoSub}>Monto pagado: ${service?.monto_cotizacion || '450.00'} MXN</Text>
            </View>
          </View>
        )}

        {/* Tarjeta de Calificación para el Cliente si la orden está FINALIZADA */}
        {currentStatus === 'FINALIZADA' && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>CALIFICAR SERVICIO DEL TÉCNICO</Text>
            <Text style={styles.ratingCardSubtitle}>
              {service?.calificacion_cliente
                ? '¡Gracias! Ya has calificado este servicio.'
                : '¿Qué te pareció el trabajo realizado por el técnico?'}
            </Text>

            {/* Estrellas */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={{ padding: 4 }}
                  disabled={Boolean(service?.calificacion_cliente)}
                >
                  <Feather
                    name="star"
                    size={28}
                    color={star <= rating ? '#FFB800' : '#CBD5E0'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Comentario Opcional */}
            {!service?.calificacion_cliente && (
              <View style={{ width: '100%', marginTop: 12 }}>
                <TextInput
                  style={styles.ratingCommentInput}
                  placeholder="Escribe un comentario opcional sobre el servicio..."
                  placeholderTextColor="#A0AEC0"
                  multiline
                  numberOfLines={3}
                  value={comentario}
                  onChangeText={setComentario}
                />

                <TouchableOpacity
                  style={[styles.ratingSubmitButton, enviandoCalificacion && { opacity: 0.6 }]}
                  onPress={handleEnviarCalificacion}
                  disabled={enviandoCalificacion}
                >
                  <Text style={styles.ratingSubmitButtonText}>
                    {enviandoCalificacion ? 'ENVIANDO...' : 'ENVIAR CALIFICACIÓN'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Summary Card - Tarjeta Flotante */}
        <Text style={styles.sectionTitle}>RESUMEN DE SOLICITUD</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Feather name="map-pin" size={16} color="#FF6B1A" style={{ marginTop: 2, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>UBICACIÓN</Text>
              <Text style={styles.summaryText}>{service?.direccion || 'Dirección no especificada'}</Text>
            </View>
          </View>

          <View style={[styles.summaryRow, { marginTop: 15 }]}>
            <Feather name="file-text" size={16} color="#7A8C9E" style={{ marginTop: 2, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>DESCRIPCIÓN</Text>
              <Text style={styles.summaryText}>{service?.descripcion || 'Sin descripción adicional'}</Text>
            </View>
          </View>
        </View>

        {/* Botones de Acción dentro del ScrollView (Sin footer flotante que estorbe) */}
        <View style={styles.orderActionsContainer}>
          {['EN_PROCESO', 'EN_CAMINO'].includes(currentStatus) && (
            <TouchableOpacity
              style={[styles.sosButton, enviandoSos && { opacity: 0.6 }]}
              onPress={handleSosAlert}
              disabled={enviandoSos}
              activeOpacity={0.8}
            >
              <Feather name="alert-triangle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.sosButtonText}>SOS</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.pillButtonCancel}
            onPress={() => setCancelModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="x-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.pillButtonCancelText}>CANCELAR</Text>
          </TouchableOpacity>

          <Text style={styles.footerHint}>
            No se te cobrará nada si cancelas antes de que el técnico inicie el trabajo.
          </Text>
        </View>

      </ScrollView>

      {/* Cancel Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCancelModalVisible(false)} style={{ padding: 15 }}>
              <Feather name="x" size={24} color="#0A192F" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Detalle de Cancelación</Text>
            <View style={{ width: 54 }} />
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.cancelCard}>
              <View style={styles.cancelIconWrapper}>
                <Feather name="slash" size={24} color="#FF6B1A" />
              </View>
              <Text style={styles.cancelTitle}>Servicio Cancelado</Text>
              <Text style={styles.cancelSubtitle}>EL TÉCNICO YA ESTABA EN RUTA</Text>

              <View style={styles.cancelDashedLine} />

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelStrikethrough}>DIAGNÓSTICO Y MANO DE OBRA</Text>
                <Text style={styles.breakdownValueStrikethrough}>$450.00</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>TARIFA DE CANCELACIÓN</Text>
                <Text style={styles.breakdownValue}>$50.00</Text>
              </View>

              <View style={styles.chargeCard}>
                <View>
                  <Text style={styles.chargeCardLabel}>CARGO A TARJETA</Text>
                  <Text style={styles.chargeCardValue}>VISA **** 4242</Text>
                </View>
                <Text style={styles.chargeAmount}>$50.00</Text>
              </View>

              <Text style={styles.cancelNote}>
                *Esta tarifa se transfiere al 100% al técnico para compensar su tiempo y gastos de traslado iniciales.*
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.modalPillButton}
              onPress={() => {
                setCancelModalVisible(false);
                router.replace('/client-dashboard');
              }}
            >
              <Text style={styles.modalPillButtonText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Simulación Tarjeta Conekta */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalCard}>
            <View style={styles.paymentModalHeader}>
              <Text style={styles.paymentModalTitle}>Pasarela de Pago Conekta</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Feather name="x" size={22} color="#0A192F" />
              </TouchableOpacity>
            </View>

            <Text style={styles.paymentModalSubtitle}>Ingresa tus datos de tarjeta para completar la transacción.</Text>

            <Text style={styles.paymentInputLabel}>NÚMERO DE TARJETA</Text>
            <TextInput
              style={styles.paymentInput}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentInputLabel}>EXPIRACIÓN</Text>
                <TextInput
                  style={styles.paymentInput}
                  value={cardExp}
                  onChangeText={setCardExp}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentInputLabel}>CVC</Text>
                <TextInput
                  style={styles.paymentInput}
                  value={cardCvc}
                  onChangeText={setCardCvc}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.pagarServicioButton, procesandoPago && { opacity: 0.6 }]}
              onPress={handleProcesarPago}
              disabled={procesandoPago}
            >
              <Feather name="lock" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.pagarServicioButtonText}>
                {procesandoPago ? 'PROCESANDO PAGO...' : `PROCESAR PAGO DE $${service?.monto_cotizacion || 450} MXN`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF3' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerSubtitle: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  
  /* Tarjeta Flotante Blanco Puro (#FFFFFF) para Área de Estado */
  statusAreaCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    paddingHorizontal: 24, 
    paddingTop: 30, 
    paddingBottom: 30, 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  clockPulseWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  clockOuter: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#FF6B1A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  statusTitle: { fontSize: 20, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 8 },
  statusSubtitle: { fontSize: 11, color: '#7A8C9E', textAlign: 'center', lineHeight: 17, marginBottom: 30 },
  
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  stepItem: { alignItems: 'center', width: 60 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginBottom: 6 },
  stepLabel: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 4, marginBottom: 14 },

  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginLeft: 5, marginBottom: 12 },
  
  /* Tarjetas Flotantes para Técnico y Resumen */
  techCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 20, 
    borderWidth: 1,
    borderColor: '#F0F4F8',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3 
  },
  techInfoLeft: { flexDirection: 'row', alignItems: 'center' },
  techAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B1A', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  techName: { fontSize: 14, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  techMeta: { flexDirection: 'row', alignItems: 'center' },
  techRoleBadge: { backgroundColor: '#E0F7FA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  techRoleText: { fontSize: 8, fontWeight: '800', color: '#00838F', letterSpacing: 1 },
  techRating: { fontSize: 10, fontWeight: '800', color: '#D97706' },
  sepBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginTop: 4, alignSelf: 'flex-start' },
  sepBadgeText: { fontSize: 8, fontWeight: '800', color: '#1E40AF', letterSpacing: 0.5 },
  
  chatButtonPill: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFD8BE' },

  summaryCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start' },
  summaryLabel: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 4 },
  summaryText: { fontSize: 12, color: '#4A5568', fontWeight: '500' },

  orderActionsContainer: {
    marginTop: 10,
    marginBottom: 30,
    gap: 12,
  },
  pillButtonCancel: { 
    backgroundColor: '#FFF5F5', 
    borderWidth: 1, 
    borderColor: '#FEB2B2', 
    paddingVertical: 14, 
    paddingHorizontal: 16,
    borderRadius: 25, 
    alignItems: 'center', 
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pillButtonCancelText: { color: '#E53E3E', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, lineHeight: 18 },
  footerHint: { fontSize: 10, color: '#7A8C9E', textAlign: 'center', fontWeight: '500', lineHeight: 14, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E8EEF3' },
  modalHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0A192F' },
  modalBody: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 25, justifyContent: 'center' },
  cancelCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 26, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 6, marginBottom: 25 },
  cancelIconWrapper: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cancelTitle: { fontSize: 22, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 8 },
  cancelSubtitle: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 24 },
  cancelDashedLine: { width: '100%', height: 1, borderWidth: 1, borderColor: '#E8EEF3', borderStyle: 'dashed', marginBottom: 20 },
  
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  breakdownLabelStrikethrough: { fontSize: 8, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1, textDecorationLine: 'line-through' },
  breakdownValueStrikethrough: { fontSize: 10, fontWeight: '700', color: '#A0AEC0', textDecorationLine: 'line-through' },
  breakdownLabel: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  breakdownValue: { fontSize: 12, fontWeight: '800', color: '#0A192F' },

  chargeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, marginTop: 10, marginBottom: 20 },
  chargeCardLabel: { fontSize: 7, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 2 },
  chargeCardValue: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  chargeAmount: { fontSize: 18, fontWeight: '800', color: '#FF6B1A' },

  cancelNote: { fontSize: 9, color: '#7A8C9E', textAlign: 'center', fontWeight: '500', lineHeight: 14 },
  
  modalPillButton: { backgroundColor: '#FF6B1A', paddingVertical: 14, borderRadius: 25, alignItems: 'center', shadowColor: '#FF6B1A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  modalPillButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  cotizacionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F0F4F8', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cotizacionBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cotizacionCardTitle: { fontSize: 10, fontWeight: '800', color: '#718096', letterSpacing: 1.2 },
  cotizacionMonto: { fontSize: 26, fontWeight: '800', color: '#1A202C', marginBottom: 6 },
  cotizacionDetalles: { fontSize: 13, color: '#4A5568', lineHeight: 18, marginBottom: 18 },
  cotizacionActionRow: { flexDirection: 'row', gap: 10 },
  cotizacionButtonAceptar: { flex: 1, flexDirection: 'row', backgroundColor: '#15803D', paddingVertical: 12, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#15803D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  cotizacionButtonAceptarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  cotizacionButtonRechazar: { flex: 1, flexDirection: 'row', backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  cotizacionButtonRechazarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  evidenciaDisplayImage: { width: '100%', height: 160, borderRadius: 12, marginTop: 8 },
  ratingCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F0F4F8', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  ratingCardTitle: { fontSize: 11, fontWeight: '800', color: '#1A202C', letterSpacing: 1.2, marginBottom: 4 },
  ratingCardSubtitle: { fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  ratingCommentInput: { width: '100%', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#F8FAFC', color: '#1A202C', fontSize: 13, height: 75, textAlignVertical: 'top', marginBottom: 12 },
  ratingSubmitButton: { width: '100%', backgroundColor: '#FF6B1A', paddingVertical: 14, borderRadius: 25, alignItems: 'center', shadowColor: '#FF6B1A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  ratingSubmitButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  sosButton: { backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 12, width: '100%', shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  sosButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

  pagarServicioButton: { flexDirection: 'row', backgroundColor: '#16A34A', paddingVertical: 15, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  pagarServicioButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  pagoCompletadoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#86EFAC' },
  pagoCompletadoTitle: { fontSize: 12, fontWeight: '800', color: '#14532D', letterSpacing: 1 },
  pagoCompletadoSub: { fontSize: 12, color: '#166534', marginTop: 2 },
  paymentModalOverlay: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.7)', justifyContent: 'center', paddingHorizontal: 20 },
  paymentModalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  paymentModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  paymentModalTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F' },
  paymentModalSubtitle: { fontSize: 12, color: '#7A8C9E', marginBottom: 18 },
  paymentInputLabel: { fontSize: 9, fontWeight: '800', color: '#4A5568', letterSpacing: 1, marginBottom: 4 },
  paymentInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1A202C', marginBottom: 14 },
});
