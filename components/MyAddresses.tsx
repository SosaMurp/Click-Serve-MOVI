import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MyAddresses() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
        >
          <View style={styles.addIconWrapper}>
            <Feather name="plus" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.addButtonText}>AGREGAR NUEVA UBICACIÓN</Text>
        </TouchableOpacity>

        {/* Address Card 1 */}
        <View style={styles.card}>
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapBadge}>
              <Text style={styles.mapBadgeText}>PRINCIPAL</Text>
            </View>
            <Feather name="map-pin" size={24} color="#0A192F" style={styles.mapPin} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Feather name="home" size={16} color="#7A8C9E" />
                <Text style={styles.cardTitle}>CASA</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/edit-address' as any)}>
                <Feather name="more-vertical" size={18} color="#D1D9E0" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardAddress}>Av. Lázaro Cárdenas 1520, Interior 48</Text>
            <Text style={styles.cardAddress}>Col. Centro, CP 60950</Text>
          </View>
        </View>

        {/* Address Card 2 */}
        <View style={styles.card}>
          <View style={[styles.mapPlaceholder, { backgroundColor: '#E1E8ED' }]}>
            <Feather name="map-pin" size={24} color="#0A192F" style={styles.mapPin} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Feather name="briefcase" size={16} color="#7A8C9E" />
                <Text style={styles.cardTitle}>OFICINA</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/edit-address' as any)}>
                <Feather name="more-vertical" size={18} color="#D1D9E0" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardAddress}>Puerto Arista 44, Edificio Global</Text>
            <Text style={styles.cardAddress}>Zona Industrial</Text>
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Feather name="info" size={14} color="#9CA8B6" style={{ marginTop: 2 }} />
          <Text style={styles.footerNoteText}>
            TUS DIRECCIONES SOLO SON COMPARTIDAS CON EL TÉCNICO UNA VEZ QUE LA SOLICITUD HA SIDO CONFIRMADA MUTUAMENTE.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D9E0', borderRadius: 4, marginBottom: 25 },
  addIconWrapper: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addButtonText: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#F0F4F8', overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  mapPlaceholder: { height: 100, backgroundColor: '#D1D9E0', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mapBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  mapBadgeText: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  mapPin: { opacity: 0.7 },
  cardInfo: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginLeft: 8 },
  cardAddress: { fontSize: 14, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  footerNote: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 8, marginTop: 10 },
  footerNoteText: { flex: 1, fontSize: 9, color: '#9CA8B6', fontWeight: '700', letterSpacing: 0.5, lineHeight: 14, marginLeft: 10 },
});
