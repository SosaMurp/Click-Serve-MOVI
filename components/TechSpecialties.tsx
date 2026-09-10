import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Switch
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechSpecialties() {
  const router = useRouter();
  const [hardwareActive, setHardwareActive] = useState(true);
  const [networksActive, setNetworksActive] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Especialidades</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.subtitle}>CONTROLA QUÉ TIPO DE SOLICITUDES RECIBES EN TU RADAR.</Text>

        <Text style={styles.sectionTitle}>ESPECIALIDADES ACTIVAS</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconWrapper}>
                <Feather name="monitor" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Soporte y Hardware</Text>
                <View style={styles.verifiedRow}>
                  <Feather name="check" size={10} color="#10B981" />
                  <Text style={styles.verifiedText}>VERIFICADO</Text>
                </View>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
              onValueChange={() => setHardwareActive(!hardwareActive)}
              value={hardwareActive}
            />
          </View>
          <Text style={styles.cardDescription}>
            Ensamblaje, reparación de componentes, diagnóstico de fallas eléctricas y fuentes de poder.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconWrapper}>
                <Feather name="wifi" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Redes y Conectividad</Text>
                <View style={styles.verifiedRow}>
                  <Feather name="check" size={10} color="#10B981" />
                  <Text style={styles.verifiedText}>VERIFICADO</Text>
                </View>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E2E8F0"
              onValueChange={() => setNetworksActive(!networksActive)}
              value={networksActive}
            />
          </View>
          <Text style={styles.cardDescription}>
            Configuración de routers, cableado estructurado, repetidoras Wi-Fi y redes domésticas.
          </Text>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>EN REVISIÓN</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewIndicator} />
          <View style={styles.reviewCardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconWrapperLight}>
                  <Feather name="code" size={18} color="#9CA8B6" />
                </View>
                <View>
                  <Text style={styles.cardTitleLight}>Desarrollo y Diseño Web</Text>
                  <View style={styles.verifiedRow}>
                    <Feather name="clock" size={10} color="#F59E0B" />
                    <Text style={[styles.verifiedText, { color: '#F59E0B' }]}>VALIDANDO PORTAFOLIO</Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.cardDescription}>
              Creación de landing pages, bases de datos (MySQL) y aplicaciones a la medida.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.newSpecialtyButton}>
          <Feather name="plus" size={20} color="#9CA8B6" style={{ marginBottom: 10 }} />
          <Text style={styles.newSpecialtyText}>SOLICITAR NUEVA ESPECIALIDAD</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-dashboard' as any)}>
          <Feather name="package" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="users" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-profile' as any)}>
          <Feather name="user" size={24} color="#0A192F" />
          <View style={styles.activeDot} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 100 },
  
  subtitle: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, textAlign: 'center', marginBottom: 40 },
  
  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  badge: { backgroundColor: '#FEF3C7', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#D97706' },

  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1.5, marginLeft: 4 },
  cardDescription: { fontSize: 11, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 18 },
  
  reviewCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, overflow: 'hidden', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  reviewIndicator: { width: 4, backgroundColor: '#F59E0B' },
  reviewCardContent: { flex: 1, padding: 20 },
  iconWrapperLight: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F0F4F8' },
  cardTitleLight: { fontSize: 14, fontWeight: '800', color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  
  newSpecialtyButton: { borderWidth: 1, borderColor: '#D1D9E0', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  newSpecialtyText: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0A192F', marginTop: 4 }
});
