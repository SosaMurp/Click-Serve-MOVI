import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SearchTech() {
  const router = useRouter();

  // Simulate finding a tech after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/order-status' as any);
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Background Map Placeholder */}
      <View style={styles.mapBackground}>
        {/* Simulating map with a subtle grid or solid color since we can't use a real map component here easily */}
        <View style={styles.mapGrid} />
        
        {/* Center Pulse Animation Marker */}
        <View style={styles.pulseOuter}>
          <View style={styles.pulseInner} />
        </View>
      </View>

      {/* Top Buttons */}
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity style={styles.topButton} onPress={() => router.push('/client-dashboard' as any)}>
          <Feather name="home" size={16} color="#0A192F" />
          <Text style={styles.topButtonText}>INICIO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={() => router.push('/my-requests' as any)}>
          <Text style={styles.topButtonText}>MIS SOLICITUDES</Text>
          <Feather name="clipboard" size={16} color="#0A192F" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Buscando...</Text>
        <Text style={styles.subtitle}>CONTACTANDO TÉCNICOS CERCANOS A TU ZONA...</Text>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>CANCELAR BÚSQUEDA</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E1E8ED' },
  mapBackground: { ...StyleSheet.absoluteFill, backgroundColor: '#E1E8ED', justifyContent: 'center', alignItems: 'center' },
  mapGrid: { ...StyleSheet.absoluteFill, opacity: 0.1, backgroundColor: '#FFFFFF' }, // Placeholder for map tiles
  
  pulseOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(10, 25, 47, 0.1)', justifyContent: 'center', alignItems: 'center' },
  pulseInner: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#0A192F', borderWidth: 4, borderColor: '#FFFFFF' },

  topButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  topButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  topButtonText: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginHorizontal: 8 },

  bottomSheet: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 30, alignItems: 'center', shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 15 },
  subtitle: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, textAlign: 'center', marginBottom: 30, lineHeight: 14 },
  cancelButton: { padding: 10 },
  cancelButtonText: { fontSize: 9, fontWeight: '800', color: '#FF6B6B', letterSpacing: 1.5 },
});
