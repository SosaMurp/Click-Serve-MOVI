import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

export default function TechSettings() {
  const router = useRouter();
  const { user } = useAuth();

  // Estados para los switches de la vista
  const [nuevasSolicitudes, setNuevasSolicitudes] = useState(true);
  const [efectosSonido, setEfectosSonido] = useState(false);
  const [bloqueoBiometrico, setBloqueoBiometrico] = useState(true);

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
      // Actualización del estado local
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
      
      {/* Header Estilo Click&Serve */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 34 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* BLOQUE 1: TRABAJO Y RUTAS */}
        <Text style={styles.sectionTitle}>TRABAJO Y RUTAS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="globe" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>ZONA DE COBERTURA</Text>
              <Text style={styles.rowSubtitle}>Delimitada a tu ciudad de registro</Text>
            </View>
            <View style={styles.badge}>
              <Feather name="lock" size={10} color="#7A8C9E" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>LÁZARO CÁRDENAS</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="navigation" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>MEDIO DE TRANSPORTE</Text>
            </View>
            <Text style={styles.italicValue}>Motocicleta</Text>
            <Feather name="chevron-right" size={18} color="#D1D9E0" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>

        {/* BLOQUE 2: NOTIFICACIONES */}
        <Text style={styles.sectionTitle}>NOTIFICACIONES</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="bell" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>NUEVAS SOLICITUDES</Text>
              <Text style={styles.rowSubtitle}>Avisos de trabajos cercanos</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D9E0', true: '#0A192F' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#D1D9E0"
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
              <Text style={styles.rowSubtitle}>Timbre al recibir un mensaje</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D9E0', true: '#0A192F' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#D1D9E0"
              onValueChange={setEfectosSonido}
              value={efectosSonido}
            />
          </View>
        </View>

        {/* BLOQUE 3: DISPOSITIVOS Y SESIONES ACTIVAS */}
        <Text style={styles.sectionTitle}>DISPOSITIVOS ACTIVOS</Text>
        
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

        {/* BLOQUE 4: SEGURIDAD */}
        <Text style={styles.sectionTitle}>SEGURIDAD</Text>
        <View style={styles.card}>
          
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.push('/change-password' as any)}
          >
            <View style={styles.iconWrapper}>
              <Feather name="lock" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>CAMBIAR CONTRASEÑA</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#D1D9E0" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Feather name="shield" size={18} color="#0A192F" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>BLOQUEO BIOMÉTRICO</Text>
              <Text style={styles.rowSubtitle}>Pedir FaceID al retirar fondos</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D9E0', true: '#28A745' }} // Switch verde exacto de tu captura
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#D1D9E0"
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

        <TouchableOpacity style={styles.deleteButton}>
          <Feather name="trash-2" size={14} color="#FF6B6B" style={{ marginRight: 8 }} />
          <Text style={styles.deleteButtonText}>ELIMINAR CUENTA DEFINITIVAMENTE</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Click&Serve v1.0.0 (Build 101)</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 40 },
  sectionTitle: { fontSize: 10, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginTop: 10 },
  
  // Tarjetas Blancas Agrupadas
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#F0F4F8', paddingHorizontal: 15, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 5, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  iconWrapper: { width: 34, height: 34, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textContainer: { flex: 1 },
  rowTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 0.5 },
  rowSubtitle: { fontSize: 11, color: '#9CA8B6', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F4F6F8' },

  // Estilos para Sesiones
  sessionsContainer: {
    backgroundColor: '#F9FAFC',
    borderRadius: 8, // Adaptado al estilo de tarjeta de técnico
    padding: 15,
    marginBottom: 25,
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
    borderRadius: 6,
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
    fontSize: 12,
    fontWeight: '800',
    color: '#0A192F',
    marginBottom: 2,
  },
  sessionDetails: {
    fontSize: 10,
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

  // Badges e Italic Labels
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4 },
  badgeText: { fontSize: 8, color: '#7A8C9E', fontWeight: '800', letterSpacing: 0.5 },
  italicValue: { fontSize: 13, color: '#7A8C9E', fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  // Footer
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 20 },
  footerLinkText: { fontSize: 9, color: '#9CA8B6', fontWeight: '700', letterSpacing: 1 },
  footerDivider: { fontSize: 10, color: '#D1D9E0', marginHorizontal: 10 },
  
  deleteButton: { flexDirection: 'row', borderWidth: 1, borderColor: '#FFF0F0', backgroundColor: '#FFFAFA', paddingVertical: 16, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  deleteButtonText: { color: '#FF6B6B', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  versionText: { textAlign: 'center', fontSize: 9, color: '#C4CDD5', fontWeight: '600', letterSpacing: 0.5 }
});