import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    return <View style={styles.center}><ActivityIndicator size="large" color="#0A192F" /></View>;
  }

  if (!service) {
    return <View style={styles.center}><Text style={styles.empty}>Servicio no encontrado.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={styles.avatar}><Feather name="user" size={42} color="#7A8C9E" /></View>
        <Text style={styles.name}>{service.technicianName}</Text>
        <Text style={styles.specialty}>{service.specialty} · {service.category}</Text>
        <View style={styles.stats}>
          <View><Text style={styles.statValue}>{service.rating.toFixed(1)}</Text><Text style={styles.statLabel}>RATING</Text></View>
          <View><Text style={styles.statValue}>{service.completedJobs}</Text><Text style={styles.statLabel}>TRABAJOS</Text></View>
          <View><Text style={styles.statValue}>${service.baseRate}</Text><Text style={styles.statLabel}>TARIFA BASE</Text></View>
        </View>
        <Text style={styles.sectionTitle}>SOBRE EL SERVICIO</Text>
        <Text style={styles.description}>{service.description}</Text>
        <View style={styles.locationRow}><Feather name="map-pin" size={16} color="#7A8C9E" /><Text style={styles.location}>{service.location}</Text></View>
        <TouchableOpacity style={styles.requestButton} onPress={() => router.push({ pathname: '/service-details', params: { technicianId: service.id, technicianName: service.technicianName } } as any)}>
          <Text style={styles.requestText}>SOLICITAR SERVICIO</Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, paddingBottom: 40 },
  backButton: { paddingVertical: 4, alignSelf: 'flex-start' },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#F4F6F8', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 16 },
  name: { color: '#0A192F', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  specialty: { color: '#7A8C9E', fontSize: 13, textAlign: 'center', marginTop: 6 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', borderWidth: 1, borderColor: '#E8EEF3', borderRadius: 10, paddingVertical: 18, marginTop: 28 },
  statValue: { color: '#0A192F', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  statLabel: { color: '#9CA8B6', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 4, textAlign: 'center' },
  sectionTitle: { color: '#7A8C9E', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 32, marginBottom: 12 },
  description: { color: '#506174', fontSize: 15, lineHeight: 23 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  location: { color: '#7A8C9E', fontSize: 13, marginLeft: 8 },
  requestButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A192F', borderRadius: 6, paddingVertical: 17, marginTop: 36 },
  requestText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginRight: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  empty: { color: '#7A8C9E' },
});
