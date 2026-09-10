import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
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
  const { user } = useAuth();

  const [name, setName] = useState(user ? `${user.nombre} ${user.apellido || ''}`.trim() : 'Carlos Mendoza');
  const [email, setEmail] = useState(user ? user.correo : 'c.mendoza@email.com');
  const [phone, setPhone] = useState(user ? user.telefono : '+52 753 123 4567');
  const [pushNotifications, setPushNotifications] = useState(true);

  // Estados para gestionar las sesiones
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);

  // Cargar las sesiones activas consumiendo GET /api/auth/sessions
  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await api.get('/api/auth/sessions');
      // Esperamos { sesiones: [...] }
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
      // Petición real al backend
      await api.delete(`/api/auth/sessions/${sessionId}`);

      // Actualización del estado local: removemos la sesión desvinculada
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
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Feather name="x" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos de Cuenta</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.saveText}>GUARDAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Sección: Información Personal */}
        <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMBRE COMPLETO</Text>
          <TextInput
            style={[styles.input, styles.serifItalicInput]}
            value={name}
            onChangeText={setName}
            selectionColor="#0A192F"
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
            selectionColor="#0A192F"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TELÉFONO CELULAR</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            selectionColor="#0A192F"
          />
        </View>

        {/* Sección: Dispositivos y Sesiones Activas */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>DISPOSITIVOS ACTIVOS</Text>
        
        {isLoadingSessions ? (
          <ActivityIndicator size="small" color="#0A192F" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.sessionsContainer}>
            {sessions.map((session) => {
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
                <View key={session.id_sesion} style={styles.sessionRow}>
                  <View style={styles.sessionIconWrapper}>
                    <Feather 
                      name={isIosOrMobile ? 'smartphone' : 'monitor'} 
                      size={20} 
                      color="#0A192F" 
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
                    >
                      {isUnlinking === session.id_sesion ? (
                        <ActivityIndicator size="small" color="#FF6B6B" />
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
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>PREFERENCIAS</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>NOTIFICACIONES PUSH</Text>
            <Text style={styles.settingSubtitle}>Alertas sobre técnicos en camino</Text>
          </View>
          <Switch
            trackColor={{ false: '#D1D9E0', true: '#0A192F' }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor="#D1D9E0"
            onValueChange={setPushNotifications}
            value={pushNotifications}
          />
        </View>

        {/* Seguridad */}
        <TouchableOpacity 
          style={styles.settingRowTouchable} 
          onPress={() => router.push('/change-password' as any)} 
        >
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>CAMBIAR CONTRASEÑA</Text>
            <Text style={styles.settingSubtitle}>Actualiza tu clave de acceso</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#D1D9E0" />
        </TouchableOpacity>

        {/* Botón Peligroso */}
        <TouchableOpacity style={styles.deleteButton}>
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  iconButton: { padding: 5 },
  saveText: { fontSize: 10, color: '#7A8C9E', fontWeight: '800', letterSpacing: 1 },
  scrollContainer: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 50 },
  sectionTitle: { fontSize: 10, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1.5, marginBottom: 25 },
  inputGroup: { marginBottom: 30 },
  label: { fontSize: 9, color: '#7A8C9E', fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
  input: { fontSize: 16, color: '#0A192F', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F4F8', fontWeight: '600' },
  serifItalicInput: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', fontSize: 20, fontWeight: 'normal' },
  
  // Estilos para Sesiones
  sessionsContainer: {
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F4F8'
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8'
  },
  sessionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF'
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
    color: '#7A8C9E',
  },
  unlinkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#FFF0F0',
  },
  unlinkButtonText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#E8F5E9',
  },
  currentBadgeText: {
    color: '#2E7D32',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  settingRowTouchable: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  settingTextContainer: { flex: 1, paddingRight: 15 },
  settingTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginBottom: 4 },
  settingSubtitle: { fontSize: 11, color: '#7A8C9E', fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  deleteButton: { borderWidth: 1, borderColor: '#FFF0F0', paddingVertical: 16, borderRadius: 4, alignItems: 'center', marginTop: 50, marginBottom: 15 },
  deleteButtonText: { color: '#FF6B6B', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  deleteWarning: { textAlign: 'center', fontSize: 8, color: '#9CA8B6', fontWeight: '700', letterSpacing: 1, lineHeight: 14 }
});