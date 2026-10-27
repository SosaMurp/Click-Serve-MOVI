import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from './context/AuthContext';

export default function MyAddresses() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [direcciones, setDirecciones] = useState<any[]>([]);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/direcciones');
      if (res && res.status >= 400) {
        throw new Error(res.data?.error || `Error HTTP ${res.status}`);
      }
      if (res && res.data?.direcciones) {
        setDirecciones(res.data.direcciones);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de conexión al cargar direcciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Direcciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Add New Location Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/edit-address' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.addIconWrapper}>
            <Feather name="plus" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.addButtonText}>AGREGAR NUEVA UBICACIÓN</Text>
        </TouchableOpacity>

        {/* Dynamic Addresses */}
        {direcciones.length > 0 ? (
          direcciones.map((dir, idx) => (
            <View key={dir.id_direccion || dir.id || idx} style={styles.card}>
              <View style={styles.mapPlaceholder}>
                <View style={styles.mapBadge}>
                  <Text style={styles.mapBadgeText}>{idx === 0 ? 'PRINCIPAL' : 'GUARDADA'}</Text>
                </View>
                <Feather name="map-pin" size={24} color="#FF6B1A" style={styles.mapPin} />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Feather name={dir.etiqueta?.toLowerCase()?.includes('oficina') ? 'briefcase' : 'home'} size={16} color="#FF6B1A" />
                    <Text style={styles.cardTitle}>{dir.etiqueta ? dir.etiqueta.toUpperCase() : 'CASA'}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push({ pathname: '/edit-address', params: { id: String(dir.id_direccion || dir.id) } } as any)}
                    activeOpacity={0.8}
                  >
                    <Feather name="more-vertical" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardAddress}>
                  {dir.calle}{dir.numero ? ` #${dir.numero}` : ''}{dir.interior ? `, Int. ${dir.interior}` : ''}
                </Text>
                <Text style={styles.cardSubAddress}>
                  {dir.colonia ? `Col. ${dir.colonia}` : ''}{dir.cp ? `, CP ${dir.cp}` : ''}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <>
            {/* Address Card 1 Default */}
            <View style={styles.card}>
              <View style={styles.mapPlaceholder}>
                <View style={styles.mapBadge}>
                  <Text style={styles.mapBadgeText}>PRINCIPAL</Text>
                </View>
                <Feather name="map-pin" size={24} color="#FF6B1A" style={styles.mapPin} />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Feather name="home" size={16} color="#FF6B1A" />
                    <Text style={styles.cardTitle}>CASA</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/edit-address' as any)} activeOpacity={0.8}>
                    <Feather name="more-vertical" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardAddress}>Av. Lázaro Cárdenas 1520, Interior 48</Text>
                <Text style={styles.cardSubAddress}>Col. Centro, CP 60950</Text>
              </View>
            </View>

            {/* Address Card 2 Default */}
            <View style={styles.card}>
              <View style={[styles.mapPlaceholder, { backgroundColor: '#F1F5F9' }]}>
                <Feather name="map-pin" size={24} color="#FF6B1A" style={styles.mapPin} />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Feather name="briefcase" size={16} color="#FF6B1A" />
                    <Text style={styles.cardTitle}>OFICINA</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/edit-address' as any)} activeOpacity={0.8}>
                    <Feather name="more-vertical" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardAddress}>Puerto Arista 44, Edificio Global</Text>
                <Text style={styles.cardSubAddress}>Zona Industrial</Text>
              </View>
            </View>
          </>
        )}

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Feather name="info" size={14} color="#94A3B8" style={{ marginTop: 2 }} />
          <Text style={styles.footerNoteText}>
            TUS DIRECCIONES SOLO SON COMPARTIDAS CON EL TÉCNICO UNA VEZ QUE LA SOLICITUD HA SIDO CONFIRMADA MUTUAMENTE.
          </Text>
        </View>

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
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 52, 
    minHeight: 52, 
    borderStyle: 'dashed', 
    borderWidth: 1.5, 
    borderColor: '#FF6B1A', 
    backgroundColor: '#FFF7ED', 
    borderRadius: 14, 
    marginBottom: 20 
  },
  addIconWrapper: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF6B1A', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addButtonText: { fontSize: 11, fontWeight: '800', color: '#FF6B1A', letterSpacing: 1.5 },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    overflow: 'hidden', 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  mapPlaceholder: { height: 90, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mapBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFEDD5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  mapBadgeText: { fontSize: 9, fontWeight: '800', color: '#FF6B1A', letterSpacing: 1 },
  mapPin: { opacity: 0.9 },
  cardInfo: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginLeft: 8 },
  cardAddress: { fontSize: 14, color: '#0A192F', fontWeight: '600', marginBottom: 2 },
  cardSubAddress: { fontSize: 12, color: '#94A3B8' },
  footerNote: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', padding: 16, borderRadius: 16, marginTop: 10 },
  footerNoteText: { flex: 1, fontSize: 9, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.5, lineHeight: 14, marginLeft: 10 },
});
