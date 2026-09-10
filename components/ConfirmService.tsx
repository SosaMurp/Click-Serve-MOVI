import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConfirmService() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.headerTitle}>Confirmar Servicio</Text>

        <View style={styles.iconContainer}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Feather name="check" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.title}>¿Trabajo terminado?</Text>
        <Text style={styles.subtitle}>EL TÉCNICO ROBERTO G. HA MARCADO TU SOLICITUD COMO FINALIZADA.</Text>

        <View style={styles.serviceCard}>
          <View style={styles.serviceIconWrapper}>
            <Feather name="monitor" size={20} color="#7A8C9E" />
          </View>
          <View>
            <Text style={styles.serviceLabel}>SERVICIO REALIZADO</Text>
            <Text style={styles.serviceName}>Soporte Técnico Especializado</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/service-finished' as any)}
          >
            <Text style={styles.primaryButtonText}>SÍ, EL TÉCNICO ME ATENDIÓ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/report-incident' as any)}
          >
            <Text style={styles.secondaryButtonText}>NO, EL TÉCNICO NO ATENDIÓ EL SERVICIO</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>AÚN NO HA TERMINADO</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/report-incident' as any)}>
          <Text style={styles.reportLink}>REPORTAR UN PROBLEMA CON ESTE SERVICIO</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingBottom: 40, alignItems: 'center' },
  
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 40 },
  
  iconContainer: { marginBottom: 30 },
  iconOuter: { position: 'relative' },
  iconInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  notificationDot: { position: 'absolute', top: 5, right: 5, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FBBF24', borderWidth: 2, borderColor: '#FFFFFF' },
  
  title: { fontSize: 22, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 10 },
  subtitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, textAlign: 'center', lineHeight: 14, marginBottom: 40 },
  
  serviceCard: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  serviceIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  serviceLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 4 },
  serviceName: { fontSize: 12, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  
  buttonsContainer: { width: '100%', marginBottom: 30 },
  primaryButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 15 },
  secondaryButtonText: { color: '#7A8C9E', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  
  reportLink: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },
});
