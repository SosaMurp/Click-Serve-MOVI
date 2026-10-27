import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, api } from './context/AuthContext';

// Interfaz para definir la estructura de una sesión devuelta por el backend
interface Session {
  id_sesion: string;
  dispositivo: string;
  fecha_creacion: string;
  es_sesion_actual: boolean;
}

export default function TechSettings() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/api/cuenta');
              if (logout) await logout();
              Alert.alert('Cuenta Eliminada', 'Tu cuenta ha sido eliminada permanentemente del sistema.');
            } catch (error: any) {
              const errMsg = error.response?.data?.error || 'No se pudo eliminar la cuenta. Intenta de nuevo.';
              Alert.alert('Error', errMsg);
            }
          },
        },
      ]
    );
  };

  // Estados para los switches de la vista
  const [nuevasSolicitudes, setNuevasSolicitudes] = useState(true);
  const [efectosSonido, setEfectosSonido] = useState(false);
  const [bloqueoBiometrico, setBloqueoBiometrico] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(user?.["2FA_Activo"] || user?.twoFactorEnabled));
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  const handleToggle2FA = async (newValue: boolean) => {
    setTwoFactorEnabled(newValue);
    setIsUpdating2FA(true);
    try {
      await api.put('/api/usuarios/2fa', { activo: newValue });
      Alert.alert(
        'Seguridad 2FA',
        `Autenticación en dos pasos ${newValue ? 'activada' : 'desactivada'} correctamente.`
      );
    } catch (error: any) {
      setTwoFactorEnabled(!newValue);
      const errMsg = error.response?.data?.error || error.message || 'No se pudo actualizar 2FA.';
      Alert.alert('Error', errMsg);
    } finally {
      setIsUpdating2FA(false);
    }
  };

  // Estados para gestionar las sesiones
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);

  // Cargar las sesiones activas consumiendo GET /api/auth/sessions
  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await api.get('/api/auth/sessions');
      if (response.data && response.data.sesiones) {
        setSessions(response.data.sesiones);
      }
    } catch (error) {
      console.error('Error fetching sessions', error);
      Alert.alert('Error', 'No se pudieron cargar tus sesiones activas.');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Función para confirmar la desvinculación
  const confirmUnlink = (sessionId: string) => {
    Alert.alert(
      'Desvincular Dispositivo',
      '¿Estás seguro de que deseas cerrar tu sesión en este dispositivo? Deberás volver a ingresar tus credenciales para acceder.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Desvincular', 
          style: 'destructive', 
          onPress: () => performUnlink(sessionId) 
        }
      ]
    );
  };

  // Función para realizar la petición de revocación a DELETE /api/auth/sessions/:sessionId
  const performUnlink = async (sessionId: string) => {
    setIsUnlinking(sessionId);
    try {
      await api.delete(`/api/auth/sessions/${sessionId}`);
      setSessions(prevSessions => prevSessions.filter(s => s.id_sesion !== sessionId));
      Alert.alert('Éxito', 'El acceso fue revocado exitosamente.');
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || 'Hubo un problema al desvincular el dispositivo.';
      Alert.alert('Error', errMsg);
    } finally {
      setIsUnlinking(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* BLOQUE 1: PREFERENCIAS DE TRABAJO */}
        <Text style={styles.sectionTitle}>PREFERENCIAS DE TRABAJO</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="bell" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>NUEVAS SOLICITUDES</Text>
              <Text style={styles.rowSubtitle}>Recibir avisos de clientes cercanos</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#FF6B1A' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
              onValueChange={setNuevasSolicitudes}
              value={nuevasSolicitudes}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="volume-2" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>EFECTOS DE SONIDO</Text>
              <Text style={styles.rowSubtitle}>Sonido al asignar un servicio</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#FF6B1A' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
              onValueChange={setEfectosSonido}
              value={efectosSonido}
            />
          </View>
        </View>

        {/* BLOQUE 2: DISPOSITIVOS Y SESIONES */}
        <Text style={styles.sectionTitle}>DISPOSITIVOS ACTIVOS</Text>
        {isLoadingSessions ? (
          <ActivityIndicator size="small" color="#FF6B1A" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.card}>
            {sessions.map((session, index) => {
              const formattedDate = new Date(session.fecha_creacion).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const isIosOrMobile = session.dispositivo.toLowerCase().includes('iphone') || 
                                    session.dispositivo.toLowerCase().includes('ipad') || 
                                    session.dispositivo.toLowerCase().includes('ios') ||
                                    session.dispositivo.toLowerCase().includes('android');

              return (
                <View 
                  key={session.id_sesion} 
                  style={[styles.sessionRow, index === sessions.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.sessionIconWrapper}>
                    <Feather 
                      name={isIosOrMobile ? 'smartphone' : 'monitor'} 
                      size={18} 
                      color="#FF6B1A" 
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionDevice}>{session.dispositivo}</Text>
                    <Text style={styles.sessionDetails}>
                      Creada el: {formattedDate}
                    </Text>
                  </View>
                  
                  {session.es_sesion_actual ? (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>ACTUAL</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.unlinkButton} 
                      onPress={() => confirmUnlink(session.id_sesion)}
                      disabled={isUnlinking === session.id_sesion}
                      activeOpacity={0.8}
                    >
                      {isUnlinking === session.id_sesion ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Text style={styles.unlinkButtonText}>Desvincular</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* BLOQUE 3: SEGURIDAD */}
        <Text style={styles.sectionTitle}>SEGURIDAD</Text>
        <View style={styles.card}>
          {/* Autenticación en dos pasos (2FA) */}
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="shield" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>AUTENTICACIÓN EN DOS PASOS (2FA)</Text>
              <Text style={styles.rowSubtitle}>Solicitar código por correo al iniciar sesión</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#FF6B1A' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
              onValueChange={handleToggle2FA}
              value={twoFactorEnabled}
              disabled={isUpdating2FA}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.push('/change-password' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrapper}>
              <Feather name="lock" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>CAMBIAR CONTRASEÑA</Text>
              <Text style={styles.rowSubtitle}>Actualiza tu clave de acceso</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="check-circle" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>BLOQUEO BIOMÉTRICO</Text>
              <Text style={styles.rowSubtitle}>Pedir FaceID al retirar fondos</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
              onValueChange={setBloqueoBiometrico}
              value={bloqueoBiometrico}
            />
          </View>
        </View>

        {/* FOOTER: TERMINOS & BOTÓN ELIMINAR */}
        <View style={styles.footerLinks}>
          <Text style={styles.footerLinkText}>TÉRMINOS</Text>
          <Text style={styles.footerDivider}>•</Text>
          <Text style={styles.footerLinkText}>PRIVACIDAD</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
          <Feather name="trash-2" size={14} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.deleteButtonText}>ELIMINAR CUENTA DEFINITIVAMENTE</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Click&Serve v1.0.0 (Build 101)</Text>

      </ScrollView>
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
    paddingTop: 20, 
    paddingBottom: 15, 
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 10, color: '#94A3B8', fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginTop: 10 },
  
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    paddingHorizontal: 16, 
    marginBottom: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  iconWrapper: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  textContainer: { flex: 1, paddingRight: 10 },
  rowTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 0.5 },
  rowSubtitle: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9' },

  // Estilos para Sesiones
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  sessionIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5'
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDevice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A192F',
    marginBottom: 2,
  },
  sessionDetails: {
    fontSize: 10,
    color: '#94A3B8',
  },
  unlinkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  unlinkButtonText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  currentBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Footer
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 20 },
  footerLinkText: { fontSize: 9, color: '#94A3B8', fontWeight: '700', letterSpacing: 1 },
  footerDivider: { fontSize: 10, color: '#CBD5E1', marginHorizontal: 10 },
  
  deleteButton: { 
    flexDirection: 'row', 
    borderWidth: 1, 
    borderColor: '#FCA5A5', 
    backgroundColor: '#FEF2F2', 
    height: 52, 
    minHeight: 52, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20 
  },
  deleteButtonText: { color: '#EF4444', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  versionText: { textAlign: 'center', fontSize: 9, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5 }
});
