import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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

export default function AccountSettings() {
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

  const [name, setName] = useState(user ? `${user.nombre} ${user.apellido || ''}`.trim() : 'Carlos Mendoza');
  const [email, setEmail] = useState(user ? user.correo : 'c.mendoza@email.com');
  const [phone, setPhone] = useState(user ? user.telefono : '+52 753 123 4567');
  const [pushNotifications, setPushNotifications] = useState(true);
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
      
      {/* Header Tipo Modal */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.8}>
          <Feather name="x" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos de Cuenta</Text>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
          <Text style={styles.saveText}>GUARDAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Sección: Información Personal */}
        <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOMBRE COMPLETO</Text>
            <TextInput
              style={[styles.input, styles.serifItalicInput]}
              value={name}
              onChangeText={setName}
              selectionColor="#FF6B1A"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#FF6B1A"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>TELÉFONO CELULAR</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              selectionColor="#FF6B1A"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Sección: Dispositivos y Sesiones Activas */}
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

        {/* Sección: Preferencias */}
        <Text style={styles.sectionTitle}>PREFERENCIAS</Text>
        <View style={styles.card}>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>NOTIFICACIONES PUSH</Text>
              <Text style={styles.settingSubtitle}>Alertas sobre técnicos en camino</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#FF6B1A' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
              onValueChange={setPushNotifications}
              value={pushNotifications}
            />
          </View>
        </View>

        {/* Sección: Seguridad */}
        <Text style={styles.sectionTitle}>SEGURIDAD</Text>
        <View style={styles.card}>
          {/* Autenticación en dos pasos (2FA) */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>AUTENTICACIÓN EN DOS PASOS (2FA)</Text>
              <Text style={styles.settingSubtitle}>Solicitar código por correo al iniciar sesión</Text>
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

          {/* Cambiar contraseña */}
          <TouchableOpacity 
            style={[styles.settingRowTouchable, { borderBottomWidth: 0 }]} 
            onPress={() => router.push('/change-password' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>CAMBIAR CONTRASEÑA</Text>
              <Text style={styles.settingSubtitle}>Actualiza tu clave de acceso</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Botón Peligroso */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
          <Text style={styles.deleteButtonText}>ELIMINAR CUENTA PERMANENTEMENTE</Text>
        </TouchableOpacity>
        <Text style={styles.deleteWarning}>
          TUS DATOS SERÁN BORRADOS DE ACUERDO A NUESTRA{'\n'}POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES.
        </Text>

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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  iconButton: { padding: 5 },
  saveText: { fontSize: 11, color: '#FF6B1A', fontWeight: '800', letterSpacing: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  sectionTitle: { fontSize: 10, color: '#94A3B8', fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginTop: 10 },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 9, color: '#94A3B8', fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  input: { 
    fontSize: 15, 
    color: '#0A192F', 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    fontWeight: '600' 
  },
  serifItalicInput: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', fontSize: 16, fontWeight: 'normal' },
  
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
    fontSize: 13,
    fontWeight: '700',
    color: '#0A192F',
    marginBottom: 2,
  },
  sessionDetails: {
    fontSize: 11,
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

  settingRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  settingRowTouchable: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  settingTextContainer: { flex: 1, paddingRight: 15 },
  settingTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 0.5, marginBottom: 4 },
  settingSubtitle: { fontSize: 11, color: '#94A3B8' },
  deleteButton: { 
    height: 52, 
    minHeight: 52, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#FCA5A5', 
    backgroundColor: '#FEF2F2', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 25, 
    marginBottom: 15 
  },
  deleteButtonText: { color: '#EF4444', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  deleteWarning: { textAlign: 'center', fontSize: 8, color: '#94A3B8', fontWeight: '700', letterSpacing: 1, lineHeight: 14 }
});
