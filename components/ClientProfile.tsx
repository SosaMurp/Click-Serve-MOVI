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
// 1. Importamos useLocalSearchParams
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function ClientProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout(); 
  };

  const OptionItem = ({ icon, title, subtitle, onPress }: { icon: any, title: string, subtitle: string, onPress?: () => void }) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionIconWrapper}>
        <Feather name={icon} size={18} color="#0A192F" />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#D1D9E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={() => router.push('/account-settings' as any)}>
          <Feather name="settings" size={22} color="#7A8C9E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Avatar y Nombre */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle} />
            <TouchableOpacity style={styles.cameraBadge}>
              <Feather name="camera" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* 4. 👈 CAMBIO AQUÍ: Nombre dinámico uniendo las columnas de tu DB */}
          <Text style={styles.userName}>
            {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
          </Text>
          <Text style={styles.userLocation}>LÁZARO CÁRDENAS, MICH.</Text>
        </View>

        {/* Tarjeta de Estadísticas */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>SERVICIOS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5.0</Text>
            <Text style={styles.statLabel}>RATING</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            {/* 5. 👈 CAMBIO AQUÍ: Extraemos el año de creación si lo ocupas, o dejamos fijo tu diseño */}
            <Text style={styles.statValue}>2026</Text>
            <Text style={styles.statLabel}>MIEMBRO</Text>
          </View>
        </View>

        {/* Lista de Preferencias */}
        <Text style={styles.sectionTitle}>CUENTA Y PREFERENCIAS</Text>
        
        <View style={styles.optionsContainer}>
          <OptionItem icon="map-pin" title="MIS DIRECCIONES" subtitle="2 ubicaciones guardadas" onPress={() => router.push('/my-addresses' as any)} />
          <OptionItem icon="credit-card" title="MÉTODOS DE PAGO" subtitle="Visa •••• 4242" onPress={() => router.push('/payment-methods' as any)} />
          <OptionItem icon="help-circle" title="SOPORTE & AYUDA" subtitle="Centro de ayuda 24/7" onPress={() => router.push('/support' as any)} />
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/client-dashboard' as any)}>
          <Feather name="home" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="clock" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  scrollContainer: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 120 },
  profileInfoContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F4F6F8', borderWidth: 2, borderColor: '#F0F4F8' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0A192F', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  userName: { fontSize: 24, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  userLocation: { fontSize: 10, color: '#7A8C9E', fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  statsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#F0F4F8', paddingVertical: 20, marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  statLabel: { fontSize: 9, color: '#9CA8B6', fontWeight: '700', letterSpacing: 1 },
  statDivider: { width: 1, backgroundColor: '#F0F4F8' },
  sectionTitle: { fontSize: 10, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1.5, marginBottom: 15 },
  optionsContainer: { marginBottom: 30 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  optionIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 12, fontWeight: '800', color: '#0A192F', letterSpacing: 0.5, marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: '#7A8C9E', fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  logoutButton: { borderWidth: 1, borderColor: '#FFF0F0', backgroundColor: '#FFFAFA', paddingVertical: 16, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  logoutButtonText: { color: '#FF6B6B', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 }
});