import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, api } from './context/AuthContext';

export default function ClientProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.foto_perfil || null);
  const [uploading, setUploading] = useState(false);
  
  const handleLogout = async () => {
    await logout(); 
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a tus fotos para cambiar la foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const base64Data = selectedAsset.base64
          ? `data:image/jpeg;base64,${selectedAsset.base64}`
          : selectedAsset.uri;

        setAvatarUri(selectedAsset.uri);
        setUploading(true);

        // Subir al backend
        try {
          const res = await api.put('/api/usuarios/perfil', {
            foto_perfil: base64Data,
          });
          if (res.status >= 400) {
            throw new Error(res.data?.error || 'Error al actualizar perfil');
          }
          Alert.alert('Éxito', '¡Tu foto de perfil ha sido actualizada!');
        } catch (uploadErr: any) {
          console.warn('Error subiendo foto:', uploadErr);
          Alert.alert('Aviso', 'La foto se guardó localmente en tu dispositivo.');
        } finally {
          setUploading(false);
        }
      }
    } catch (err: any) {
      console.warn('Error seleccionando imagen:', err);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const biometricStatus = user?.biometria_estado === 'verificada'
    ? 'Verificado'
    : 'Pendiente de verificación';

  const OptionItem = ({ icon, title, subtitle, onPress }: { icon: any, title: string, subtitle: string, onPress?: () => void }) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionIconWrapper}>
        <Feather name={icon} size={18} color="#FF6B1A" />
      </View>
      <View style={styles.optionTextContainer}>
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
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/account-settings' as any)}>
          <Feather name="settings" size={22} color="#718096" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Avatar y Nombre */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
            ) : (
              <View style={[styles.avatarCircle, { justifyContent: 'center', alignItems: 'center' }]}>
                <Feather name="user" size={38} color="#94A3B8" />
              </View>
            )}

            <TouchableOpacity 
              style={styles.cameraBadge} 
              onPress={handlePickAvatar}
              activeOpacity={0.8}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="camera" size={12} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {user ? `${user.nombre} ${user.apellido || ''}`.trim() : 'Usuario'}
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
            <Text style={styles.statValue}>2026</Text>
            <Text style={styles.statLabel}>MIEMBRO</Text>
          </View>
        </View>

        {/* Lista de Preferencias */}
        <Text style={styles.sectionTitle}>CUENTA Y PREFERENCIAS</Text>
        
        <View style={styles.optionsCard}>
          <OptionItem icon="map-pin" title="MIS DIRECCIONES" subtitle="2 ubicaciones guardadas" onPress={() => router.push('/my-addresses' as any)} />
          <OptionItem icon="credit-card" title="MÉTODOS DE PAGO" subtitle="Visa •••• 4242" onPress={() => router.push('/payment-methods' as any)} />
          <TouchableOpacity
            style={styles.optionItemLast}
            onPress={() => router.push('/biometric-verification' as any)}
            accessibilityRole="button"
            accessibilityLabel="Verificación Facial / Biométrica"
          >
            <View style={styles.optionIconWrapper}>
              <Feather name="shield" size={18} color="#FF6B1A" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>VERIFICACIÓN FACIAL / BIOMÉTRICA</Text>
              <Text style={[styles.optionSubtitle, biometricStatus === 'Verificado' && styles.verifiedStatus]}>
                {biometricStatus}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E0" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsCard}>
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
          <Feather name="home" size={22} color="#A0AEC0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-requests' as any)}>
          <Feather name="clock" size={22} color="#A0AEC0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={22} color="#FF6B1A" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  settingsBtn: { padding: 5 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 },
  
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#E2E8F0', borderWidth: 2, borderColor: '#EDF2F7', overflow: 'hidden' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF6B1A', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF', elevation: 3 },
  userName: { fontSize: 20, fontWeight: '800', color: '#1A202C', marginBottom: 4 },
  userLocation: { fontSize: 10, color: '#718096', fontWeight: '800', letterSpacing: 1.2 },

  statsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 18, marginBottom: 25, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 2 },
  statLabel: { fontSize: 9, color: '#718096', fontWeight: '800', letterSpacing: 1 },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },

  sectionTitle: { fontSize: 10, color: '#718096', fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  optionsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  optionItemLast: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  optionIconWrapper: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 11, fontWeight: '800', color: '#1A202C', letterSpacing: 0.5, marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: '#718096' },
  verifiedStatus: { color: '#2F855A', fontWeight: '700' },

  logoutButton: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FED7D7', paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginTop: 10, shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  logoutButtonText: { color: '#E53E3E', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 65, borderTopWidth: 1, borderTopColor: '#E2E8F0', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 15 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 8 }
});
