import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function TechProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout(); 
  };

  const TechOption = ({ icon, title, subtitle, color = "#FF6B1A", onPress }: any) => (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: '#FFF5F0' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.optionInfo}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Perfil Técnico</Text>
          <Text style={styles.headerLevel}>LÁZARO CÁRDENAS • NIVEL EXPERTO</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => router.push('/tech-settings' as any)}
        >
          <Feather name="settings" size={22} color="#718096" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Info de Perfil Dinámica */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle} />
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.techName}>
            {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
          </Text>
          <Text style={styles.memberSince}>MIEMBRO DESDE OCTUBRE 2025</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
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
          <Feather name="package" size={22} color="#A0AEC0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="users" size={22} color="#A0AEC0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={22} color="#FF6B1A" />
          <View style={styles.activeDot} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
  

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  headerLevel: { fontSize: 9, color: '#718096', fontWeight: '800', letterSpacing: 1.2, marginTop: 2 },
  settingsBtn: { padding: 5 },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 },
  
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#E2E8F0', borderWidth: 2, borderColor: '#EDF2F7' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#38A169', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  techName: { fontSize: 22, fontWeight: '800', color: '#1A202C' },
  memberSince: { fontSize: 9, color: '#718096', fontWeight: '800', letterSpacing: 1, marginTop: 4 },

  statsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 18, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statBox: { flex: 1, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1A202C' },
  statLabel: { fontSize: 8, color: '#718096', fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E2E8F0', height: '60%', alignSelf: 'center' },

  optionsList: { marginBottom: 15 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 11, fontWeight: '800', color: '#1A202C', letterSpacing: 0.8, marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: '#718096' },

  logoutButton: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FED7D7', paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginTop: 10, shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  logoutButtonText: { color: '#E53E3E', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 65, borderTopWidth: 1, borderTopColor: '#E2E8F0', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 15 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 8 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6B1A', marginTop: 3 }
});