import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from './context/AuthContext';

type SpecialtyItem = {
  id_especialidad: number;
  nombre: string;
  estado: string;
  activa: boolean;
};

export default function TechSpecialties() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const availableOptions = [
    { title: 'Instalación de Cámaras y CCTV', icon: 'camera' },
    { title: 'Electricidad y Tableros', icon: 'zap' },
    { title: 'Refrigeración y Climatización', icon: 'thermometer' },
    { title: 'Plomería y Sistemas Sanitarios', icon: 'droplet' },
  ];

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/tecnico/especialidades');
      if (res.data?.especialidades) {
        setSpecialties(res.data.especialidades);
      }
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  const toggleSpecialty = async (item: SpecialtyItem) => {
    const updatedStatus = !item.activa;
    setSpecialties(prev => prev.map(s => s.id_especialidad === item.id_especialidad ? { ...s, activa: updatedStatus } : s));
    try {
      await api.patch(`/api/tecnico/especialidades/${item.id_especialidad}/toggle`, { activa: updatedStatus });
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar el cambio en el servidor.');
      loadSpecialties();
    }
  };

  const requestSpecialty = async (title: string) => {
    const exists = specialties.some(s => s.nombre.toLowerCase() === title.toLowerCase());
    if (exists) {
      Alert.alert('Especialidad registrada', `La especialidad "${title}" ya está en tu lista.`);
      return;
    }
    try {
      setIsModalVisible(false);
      await api.post('/api/tecnico/especialidades', { nombre: title });
      Alert.alert('Solicitud enviada', `Hemos registrado tu solicitud para "${title}". Un administrador revisará tus documentos.`);
      loadSpecialties();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar la nueva especialidad.');
    }
  };

  const activeSpecialties = specialties.filter(s => s.estado === 'VERIFICADO');
  const pendingSpecialties = specialties.filter(s => s.estado === 'EN_REVISION');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Especialidades</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B1A" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.subtitle}>CONTROLA QUÉ TIPO DE SOLICITUDES RECIBES EN TU RADAR.</Text>

          <Text style={styles.sectionTitle}>ESPECIALIDADES ACTIVAS</Text>

          {activeSpecialties.map(item => (
            <View key={item.id_especialidad} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.iconWrapper}>
                    <Feather name={item.nombre.toLowerCase().includes('red') ? 'wifi' : 'monitor'} size={20} color="#FF6B1A" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>{item.nombre}</Text>
                    <View style={styles.verifiedBadgePastel}>
                      <Feather name="check" size={10} color="#15803D" />
                      <Text style={styles.verifiedTextPastel}>VERIFICADO</Text>
                    </View>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: '#CBD5E0', true: '#FF6B1A' }}
                  thumbColor={'#FFFFFF'}
                  ios_backgroundColor="#CBD5E0"
                  onValueChange={() => toggleSpecialty(item)}
                  value={item.activa}
                />
              </View>
              <Text style={styles.cardDescription}>
                Especialidad activa y habilitada para recibir solicitudes en tu radar de trabajo.
              </Text>
            </View>
          ))}

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>EN REVISIÓN</Text>
            <View style={styles.badgePastel}>
              <Text style={styles.badgeTextPastel}>{pendingSpecialties.length}</Text>
            </View>
          </View>

          {pendingSpecialties.map(item => (
            <View key={item.id_especialidad} style={styles.reviewCard}>
              <View style={styles.reviewIndicator} />
              <View style={styles.reviewCardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconWrapperLight}>
                      <Feather name="code" size={18} color="#D97706" />
                    </View>
                    <View>
                      <Text style={styles.cardTitleLight}>{item.nombre}</Text>
                      <View style={styles.pendingBadgePastel}>
                        <Feather name="clock" size={10} color="#D97706" />
                        <Text style={styles.pendingTextPastel}>VALIDANDO PORTAFOLIO</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.cardDescription}>
                  Validación de acreditaciones y portafolio técnico en proceso.
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.newSpecialtyPillButton} onPress={() => setIsModalVisible(true)}>
            <Feather name="plus" size={18} color="#FF6B1A" style={{ marginRight: 8 }} />
            <Text style={styles.newSpecialtyPillText}>SOLICITAR NUEVA ESPECIALIDAD</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Modal para solicitar nueva especialidad */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A192F' }}>Solicitar Especialidad</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color="#7A8C9E" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: '#7A8C9E', marginBottom: 20, fontWeight: '500' }}>
              Selecciona una categoría adicional para someter tu perfil a revisión por nuestro equipo de validación.
            </Text>
            {availableOptions.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E8EEF3' }}
                onPress={() => requestSpecialty(opt.title)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Feather name={opt.icon as any} size={18} color="#FF6B1A" />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A192F' }}>{opt.title}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#7A8C9E" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Barra de Navegación Inferior Flotante Blanco Sólido */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-dashboard' as any)}>
          <Feather name="package" size={22} color="#7A8C9E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="users" size={22} color="#7A8C9E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-profile' as any)}>
          <View style={styles.activeDot} />
          <Feather name="user" size={22} color="#FF6B1A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF3' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scrollContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  
  subtitle: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, textAlign: 'center', marginBottom: 25 },
  
  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 14 },
  badgePastel: { backgroundColor: '#FEF3C7', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  badgeTextPastel: { fontSize: 9, fontWeight: '800', color: '#D97706' },

  /* Tarjetas Flotantes Blanco Puro (#FFFFFF) con Sombra Suave (elevation: 3) */
  card: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#F0F4F8', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: '#FFD8BE' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  verifiedBadgePastel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  verifiedTextPastel: { fontSize: 8, fontWeight: '800', color: '#15803D', letterSpacing: 1, marginLeft: 4 },
  cardDescription: { fontSize: 11, color: '#4A5568', fontWeight: '500', lineHeight: 17 },
  
  reviewCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#F0F4F8', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3 
  },
  reviewIndicator: { width: 4, backgroundColor: '#F59E0B' },
  reviewCardContent: { flex: 1, padding: 18 },
  iconWrapperLight: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cardTitleLight: { fontSize: 14, fontWeight: '800', color: '#0A192F', marginBottom: 4 },
  pendingBadgePastel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  pendingTextPastel: { fontSize: 8, fontWeight: '800', color: '#D97706', letterSpacing: 1, marginLeft: 4 },

  /* Botón Solicitud Nueva Especialidad Tipo Pastilla */
  newSpecialtyPillButton: { 
    flexDirection: 'row',
    backgroundColor: '#FFF7ED', 
    borderWidth: 1, 
    borderColor: '#FFD8BE', 
    borderRadius: 25, 
    paddingVertical: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 10,
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newSpecialtyPillText: { fontSize: 10, fontWeight: '800', color: '#FF6B1A', letterSpacing: 1.2 },

  /* Bottom Nav */
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    height: 70, 
    borderTopWidth: 1, 
    borderTopColor: '#E8EEF3', 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10, position: 'relative' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6B1A', position: 'absolute', top: 4 }
});
