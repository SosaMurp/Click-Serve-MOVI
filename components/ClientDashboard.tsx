import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ClientDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0A192F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Contenido principal scrolleable */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header: Logo y Perfil */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Click & Serve</Text>
            <Text style={styles.locationText}>LÁZARO CÁRDENAS</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/client-profile' as any)}>
            <Feather name="user" size={20} color="#7A8C9E" />
          </TouchableOpacity>
        </View>

        {/* Saludo / Pregunta Principal */}
        <Text style={styles.greetingText}>
          ¿Qué solución{'\n'}buscas hoy?
        </Text>

        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9CA8B6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ej. Refrigeración, Herrería..."
            placeholderTextColor="#9CA8B6"
            selectionColor="#001b3a"
          />
        </View>

        {/* Sección de Categorías */}
        <Text style={styles.sectionTitle}>EXPLORAR CATEGORÍAS</Text>
        
        <View style={styles.gridContainer}>
          {/* Tarjeta TECH */}
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/service-details' as any)}>
            <View style={styles.iconWrapper}>
              <Feather name="monitor" size={24} color="#7A8C9E" />
            </View>
            <Text style={styles.categoryText}>TECH</Text>
          </TouchableOpacity>

          {/* Tarjeta LUZ */}
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/service-details' as any)}>
            <View style={styles.iconWrapper}>
              <Feather name="zap" size={24} color="#7A8C9E" />
            </View>
            <Text style={styles.categoryText}>LUZ</Text>
          </TouchableOpacity>

          {/* Tarjeta HOGAR */}
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/service-details' as any)}>
            <View style={styles.iconWrapper}>
              <Feather name="home" size={24} color="#7A8C9E" />
            </View>
            <Text style={styles.categoryText}>HOGAR</Text>
          </TouchableOpacity>

          {/* Tarjeta OTROS */}
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/service-details' as any)}>
            <View style={styles.iconWrapper}>
              <Feather name="sliders" size={24} color="#7A8C9E" />
            </View>
            <Text style={styles.categoryText}>OTROS</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Mockup de la Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#0A192F" />
        </TouchableOpacity> 
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-requests' as any)}>
          <Feather name="clock" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem } onPress={() => router.push('/client-profile' as any)}>
          <Feather name="user" size={24} color="#C4CDD5" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#0A192F', letterSpacing: -0.5 },
  locationText: { fontSize: 10, color: '#7A8C9E', fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  avatarButton: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#F4F6F8', justifyContent: 'center', alignItems: 'center' },
  
  greetingText: { fontSize: 36, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 35, lineHeight: 42 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 15, height: 55, marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#0A192F' },
  
  sectionTitle: { fontSize: 11, color: '#7A8C9E', fontWeight: '700', letterSpacing: 1.5, marginBottom: 20 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 25, alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  iconWrapper: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  categoryText: { fontSize: 12, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 }
});