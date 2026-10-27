import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getServices, Service } from '../services/servicesApi';

export default function ServiceList() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const category = typeof params.category === 'string' ? params.category : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getServices(category, search).then(result => {
      if (active) setServices(result);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [category, search]);

  const title = category ? `Servicios de ${category}` : search ? `Resultados para "${search}"` : 'Servicios disponibles';

  const handleLeaveOpenAndExit = () => {
    router.replace('/client-dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>TÉCNICOS DISPONIBLES CERCA DE TI</Text>
        </View>
        <TouchableOpacity onPress={handleLeaveOpenAndExit} style={styles.exitHeaderButton}>
          <Feather name="log-out" size={18} color="#FF6B1A" />
        </TouchableOpacity>
      </View>

      {/* Botón Destacado: Dejar solicitud abierta y salir al inicio */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
        <TouchableOpacity style={styles.leaveOpenBanner} onPress={handleLeaveOpenAndExit}>
          <Feather name="globe" size={18} color="#FF6B1A" style={{ marginRight: 10 }} />
          <Text style={styles.leaveOpenBannerText}>Dejar solicitud abierta y salir al inicio</Text>
          <Feather name="chevron-right" size={18} color="#FF6B1A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#0A192F" /></View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No encontramos técnicos para esta búsqueda.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/service-detail', params: { id: item.id } } as any)}>
              <View style={styles.avatar}><Feather name="user" size={24} color="#7A8C9E" /></View>
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.technicianName}</Text>
                <Text style={styles.specialty}>{item.specialty} · {item.category}</Text>
                <Text style={styles.location}><Feather name="map-pin" size={12} color="#7A8C9E" /> {item.location}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.rating}><Feather name="star" size={13} color="#D69E2E" /> {item.rating.toFixed(1)} ({item.completedJobs} trabajos)</Text>
                  <Text style={styles.rate}>Desde ${item.baseRate} MXN</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#C4CDD5" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 5, marginRight: 10 },
  headerText: { flex: 1 },
  title: { color: '#0A192F', fontSize: 20, fontWeight: '800', lineHeight: 26 },
  subtitle: { color: '#9CA8B6', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 8 },
  exitHeaderButton: { padding: 8, backgroundColor: '#FFF7ED', borderRadius: 20, borderWidth: 1, borderColor: '#FFD8BE', marginLeft: 10 },
  leaveOpenBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderWidth: 1.5, borderColor: '#FF6B1A', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, justifyContent: 'space-between' },
  leaveOpenBannerText: { flex: 1, color: '#FF6B1A', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  list: { padding: 20, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8EEF3', borderRadius: 10, backgroundColor: '#FFFFFF' },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardBody: { flex: 1 },
  name: { color: '#0A192F', fontSize: 16, fontWeight: '800' },
  specialty: { color: '#506174', fontSize: 12, marginTop: 4 },
  location: { color: '#7A8C9E', fontSize: 11, marginTop: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 },
  rating: { color: '#506174', fontSize: 11 },
  rate: { color: '#0A192F', fontSize: 11, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#7A8C9E', paddingTop: 50 },
});
