import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechValidatingProfile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        
        {/* Glow Effect with Shield */}
        <View style={styles.glowOuter}>
          <View style={styles.glowInner}>
            <View style={styles.shieldWrapper}>
              <Feather name="shield" size={24} color="#F59E0B" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Validando Perfil</Text>
        <Text style={styles.subtitle}>
          NUESTROS SISTEMAS ESTÁN ANALIZANDO TU IDENTIDAD Y CREDENCIALES PROFESIONALES.
        </Text>

        <View style={styles.timelineCard}>
          {/* Step 1 */}
          <View style={styles.timelineStep}>
            <View style={styles.timelineIndicator}>
              <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
              <View style={[styles.timelineLine, { backgroundColor: '#E2E8F0' }]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>DATOS RECIBIDOS</Text>
              <Text style={styles.timelineDesc}>Imágenes y documentos cargados.</Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.timelineStep}>
            <View style={styles.timelineIndicator}>
              <View style={[styles.timelineRing, { borderColor: '#F59E0B' }]} />
              <View style={[styles.timelineLine, { backgroundColor: '#F0F4F8' }]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: '#0A192F' }]}>ANÁLISIS AUTOMÁTICO</Text>
              <Text style={[styles.timelineDesc, { color: '#7A8C9E' }]}>Cruce facial y validación de Cédula (SEP).</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.timelineStep}>
            <View style={styles.timelineIndicator}>
              <View style={[styles.timelineRing, { borderColor: '#E2E8F0' }]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: '#C4CDD5' }]}>RESOLUCIÓN</Text>
              <Text style={[styles.timelineDesc, { color: '#D1D9E0' }]}>Aprobación o pase a revisión manual (24h).</Text>
            </View>
          </View>
        </View>

      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => router.replace('/tech-dashboard')}
        >
          <Text style={styles.submitButtonText}>ENTENDIDO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 },
  
  glowOuter: { width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(245, 158, 11, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: -40 },
  glowInner: { width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center' },
  shieldWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },

  title: { fontSize: 26, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 15 },
  subtitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, textAlign: 'center', lineHeight: 14, marginBottom: 50, paddingHorizontal: 20 },

  timelineCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 30, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  timelineStep: { flexDirection: 'row' },
  timelineIndicator: { alignItems: 'center', width: 20, marginRight: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineRing: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, backgroundColor: '#FFFFFF' },
  timelineLine: { width: 2, height: 40, marginVertical: 5 },
  
  timelineContent: { flex: 1, paddingBottom: 30 },
  timelineTitle: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginBottom: 4 },
  timelineDesc: { fontSize: 10, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  footer: { paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, paddingTop: 20, backgroundColor: '#FFFFFF' },
  submitButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
});
