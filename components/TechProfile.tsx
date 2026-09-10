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
import { useAuth } from './context/AuthContext';

export default function TechProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout(); 
  };

  const TechOption = ({ icon, title, subtitle, color = "#0A192F", onPress }: any) => (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.optionInfo}>
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
        <View>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <Text style={styles.headerLevel}>LÁZARO CÁRDENAS • NIVEL EXPERTO</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => router.push('/tech-settings' as any)}
        >
          <Feather name="settings" size={22} color="#7A8C9E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Info de Perfil Dinámica */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle} />
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#FFFFFF" />
            </View>
          </View>
          {/* Muestra nombre y apellido dinámico de la base de datos */}
          <Text style={styles.techName}>
            {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
          </Text>
          <Text style={styles.memberSince}>MIEMBRO DESDE OCTUBRE 2025</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.ratingRow}>
              <Text style={styles.statValue}>4.9</Text>
              <Feather name="star" size={14} color="#FFB800" style={{marginLeft: 4}} />
            </View>
            <Text style={styles.statLabel}>124 RESEÑAS</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statBox}>
            <Text style={styles.statValue}>142</Text>
            <Text style={styles.statLabel}>TRABAJOS</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statBox}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>EFECTIVIDAD</Text>
          </View>
        </View>

        {/* Opciones Especiales de Técnico */}
        <View style={styles.optionsList}>
          <TechOption 
            icon="credit-card" 
            title="BILLETERA Y RETIROS" 
            subtitle="Saldo disponible: $1,420.00" 
            onPress={() => router.push('/tech-wallet' as any)}
          />
          <TechOption 
            icon="settings" 
            title="MIS ESPECIALIDADES" 
            subtitle="Soporte Técnico, Redes"
            onPress={() => router.push('/tech-specialties' as any)}
          />
          <TechOption 
            icon="help-circle" 
            title="SOPORTE CLICK&SERVE" 
            subtitle="Preguntas y contacto"
            onPress={() => router.push('/tech-support' as any)}
          />
        </View>

        {/* Botón Salir */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-dashboard' as any)}>
          <Feather name="package" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="users" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color="#0A192F" />
          <View style={styles.activeDot} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
  

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerLevel: { fontSize: 9, color: '#7A8C9E', fontWeight: '800', letterSpacing: 1.5, marginTop: 4 },
  settingsBtn: { padding: 5 },
  
  scrollContainer: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 120 },
  
  profileSection: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F0F4F8' },
  verifiedBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#28A745', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  techName: { fontSize: 28, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  memberSince: { fontSize: 10, color: '#B0BEC5', fontWeight: '700', letterSpacing: 1, marginTop: 6 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 45, paddingHorizontal: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0A192F' },
  statLabel: { fontSize: 8, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#F0F4F8', height: '60%', alignSelf: 'center' },

  optionsList: { marginBottom: 30 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#F0F4F8', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1, marginBottom: 2 },
  optionSubtitle: { fontSize: 13, color: '#7A8C9E', fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  logoutButton: { paddingVertical: 18, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8F9FA', marginTop: 10 },
  logoutButtonText: { color: '#FF6B6B', fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0A192F', marginTop: 4 }
});