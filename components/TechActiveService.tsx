import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ImageBackground
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechActiveService() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Map Background Simulation */}
      <View style={styles.mapContainer}>
        {/* Usamos un View gris claro con un patrón o color para simular el mapa, o imagen si estuviera disponible. 
            Como es mock, ponemos un fondo y algunos elementos decorativos */}
        <View style={styles.mapBackground} />
        
        {/* Route Line Simulation */}
        <View style={styles.routeLine} />
        <View style={styles.startDot} />
        <View style={styles.endDot} />
      </View>

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Servicio Actual</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>EN CAMINO</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.locationButton}>
          <Feather name="navigation" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomCardContainer}>
        <View style={styles.bottomCard}>
          
          <View style={styles.clientRow}>
            <View style={styles.clientInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JP</Text>
              </View>
              <View>
                <Text style={styles.clientName}>Juan Pérez</Text>
                <Text style={styles.clientAddress}>COLONIA CENTRO • 66950</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.phoneButton}>
              <Feather name="phone" size={16} color="#0A192F" />
            </TouchableOpacity>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>NOTA DEL CLIENTE</Text>
            <Text style={styles.noteText}>
              "Mi PC no enciende tras una descarga eléctrica. Necesito revisión de fuente de poder."
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/tech-client-chat' as any)}>
              <Feather name="message-circle" size={16} color="#0A192F" style={{ marginRight: 8 }} />
              <Text style={styles.chatButtonText}>CHAT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.arriveButton}
              onPress={() => router.push('/tech-active-work' as any)}
            >
              <Text style={styles.arriveButtonText}>HE LLEGADO</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton}>
            <Feather name="x" size={12} color="#9CA8B6" style={{ marginRight: 6 }} />
            <Text style={styles.cancelButtonText}>CANCELAR SERVICIO</Text>
          </TouchableOpacity>

        </View>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  
  mapContainer: { ...StyleSheet.absoluteFill, backgroundColor: '#E2E8F0' },
  mapBackground: { flex: 1, backgroundColor: '#E2E8F0', opacity: 0.5 },
  routeLine: { position: 'absolute', top: 120, left: 100, width: 2, height: 250, backgroundColor: '#0A192F', borderStyle: 'dashed', borderRadius: 1 },
  startDot: { position: 'absolute', top: 115, left: 96, width: 10, height: 10, borderRadius: 5, backgroundColor: '#0A192F' },
  endDot: { position: 'absolute', top: 370, left: 96, width: 10, height: 10, borderRadius: 5, backgroundColor: '#0A192F' },

  headerOverlay: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, right: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  headerTitleContainer: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  locationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', shadowColor: '#0A192F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

  bottomCardContainer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  bottomCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 25, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  
  clientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  clientInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  clientName: { fontSize: 18, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  clientAddress: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1 },
  phoneButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center' },

  noteBox: { borderLeftWidth: 2, borderLeftColor: '#0A192F', paddingLeft: 15, marginBottom: 25 },
  noteLabel: { fontSize: 7, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 8 },
  noteText: { fontSize: 13, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 22 },

  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  chatButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 16, borderRadius: 4, marginRight: 15 },
  chatButtonText: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  arriveButton: { flex: 1.5, backgroundColor: '#0A192F', paddingVertical: 16, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  arriveButtonText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },

  cancelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },
});
