import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getServiceById, Service } from '../services/servicesApi';

export default function ServiceDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getServiceById(id).then(setService).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B1A" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Servicio no encontrado.</Text>
      </View>
    );
  }

  const handleRequestService = () => {
    router.push({
      pathname: '/confirm-service',
      params: {
        category: service.category || 'TECH',
        tecnicoId: service.id,
        technicianId: service.id,
        tecnicoNombre: service.technicianName,
        technicianName: service.technicianName,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header con botón atrás */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <Feather name="chevron-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil del Técnico</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tarjeta Principal de Perfil */}
        <View style={styles.mainCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={46} color="#FF6B1A" />
          </View>
          <Text style={styles.name}>{service.technicianName}</Text>
          <Text style={styles.specialty}>{service.specialty} · {service.category}</Text>

          {/* Estadísticas */}
          <View style={styles.stats}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>★ {service.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>CALIFICACIÓN</Text>
            </View>
            <View style={[styles.statBox, styles.statBorder]}>
              <Text style={styles.statValue}>{service.completedJobs}</Text>
              <Text style={styles.statLabel}>TRABAJOS</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>${service.baseRate}</Text>
              <Text style={styles.statLabel}>TARIFA BASE</Text>
            </View>
          </View>

          {/* Sobre el servicio */}
          <Text style={styles.sectionTitle}>SOBRE EL SERVICIO</Text>
          <Text style={styles.description}>{service.description}</Text>

          {/* Ubicación */}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={16} color="#64748B" />
            <Text style={styles.location}>{service.location}</Text>
          </View>

          {/* Botón Principal Oficial */}
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestService}
            activeOpacity={0.85}
          >
            <Text style={styles.requestText}>SOLICITAR SERVICIO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FFEDD5',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  name: { color: '#0F172A', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  specialty: { color: '#64748B', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 4 },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 22,
    backgroundColor: '#F8FAFC',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E2E8F0' },
  statValue: { color: '#0F172A', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  statLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginTop: 4, textAlign: 'center' },

  sectionTitle: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 24, marginBottom: 8 },
  description: { color: '#334155', fontSize: 14, lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  location: { color: '#64748B', fontSize: 13, marginLeft: 8, fontWeight: '500' },

  requestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B1A',
    borderRadius: 14,
    height: 52,
    marginTop: 28,
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  requestText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.8 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  empty: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});
