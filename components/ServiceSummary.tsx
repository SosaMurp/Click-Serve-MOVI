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

export default function ServiceSummary() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Resumen de Servicio</Text>
          <Text style={styles.headerSubtitle}>FINALIZADO • #CK-2901</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Feather name="more-vertical" size={20} color="#9CA8B6" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Client & Earnings */}
        <View style={styles.topCard}>
          <View style={styles.clientRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JP</Text>
            </View>
            <View>
              <Text style={styles.clientName}>Juan Pérez</Text>
              <View style={styles.clientMetaRow}>
                <Text style={styles.clientMeta}>12 FEB • 2:30 PM</Text>
                <View style={styles.dot} />
                <Text style={styles.statusCompleted}>COMPLETADO</Text>
              </View>
            </View>
          </View>
          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>TU GANANCIA</Text>
            <Text style={styles.earningsValue}>+$428.00</Text>
          </View>
        </View>

        {/* Evidence */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>EVIDENCIA DEL TRABAJO</Text>
            <Text style={styles.sectionSubtitle}>Sube fotos para respaldar la garantía.</Text>
          </View>
          <Text style={styles.photoCount}>2/4 FOTOS</Text>
        </View>

        <View style={styles.evidenceGrid}>
          <View style={styles.photoBoxFilled}>
            <Feather name="image" size={24} color="#FFFFFF" />
            <View style={styles.zoomIcon}>
              <Feather name="zoom-in" size={12} color="#FFFFFF" />
            </View>
          </View>
          
          <TouchableOpacity style={styles.addPhotoBox}>
            <Feather name="plus" size={20} color="#9CA8B6" style={{ marginBottom: 5 }} />
            <Text style={styles.addPhotoText}>AGREGAR</Text>
          </TouchableOpacity>

          <View style={styles.emptyPhotoBox}>
            <Feather name="image" size={20} color="#F0F4F8" />
          </View>
        </View>

        {/* Review */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewLabel}>OPINIÓN DEL CLIENTE</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Feather key={star} name="star" size={16} color="#0A192F" style={{ marginRight: 4 }} />
            ))}
          </View>
          <Text style={styles.reviewText}>
            "Excelente servicio, Roberto fue muy limpio y rápido. La computadora quedó mejor que nueva."
          </Text>
        </View>

        {/* Tasks */}
        <Text style={styles.sectionTitle}>TAREAS REALIZADAS</Text>
        
        <View style={styles.tasksList}>
          <View style={styles.taskItem}>
            <Feather name="check" size={16} color="#10B981" style={{ marginRight: 10 }} />
            <Text style={styles.taskText}>Diagnóstico Inicial</Text>
          </View>
          <View style={styles.taskItem}>
            <Feather name="check" size={16} color="#10B981" style={{ marginRight: 10 }} />
            <Text style={styles.taskText}>Sustitución de condensadores (Extra)</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-dashboard' as any)}>
          <Feather name="package" size={24} color="#0A192F" />
          <View style={styles.activeDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="users" size={24} color="#C4CDD5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tech-profile' as any)}>
          <Feather name="user" size={24} color="#C4CDD5" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerSubtitle: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, marginTop: 4 },
  menuButton: { padding: 5, marginRight: -5 },

  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  
  topCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  clientName: { fontSize: 18, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 4 },
  clientMetaRow: { flexDirection: 'row', alignItems: 'center' },
  clientMeta: { fontSize: 9, color: '#7A8C9E', letterSpacing: 1 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D9E0', marginHorizontal: 6 },
  statusCompleted: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 1 },
  
  earningsBox: { alignItems: 'flex-end' },
  earningsLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1, marginBottom: 4 },
  earningsValue: { fontSize: 16, fontWeight: '800', color: '#0A192F' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
  sectionTitle: { fontSize: 9, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  sectionSubtitle: { fontSize: 9, color: '#9CA8B6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginTop: 4 },
  photoCount: { fontSize: 8, fontWeight: '800', color: '#C4CDD5', letterSpacing: 1 },

  evidenceGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  photoBoxFilled: { flex: 1, height: 110, backgroundColor: '#0A192F', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10, position: 'relative' },
  zoomIcon: { position: 'absolute', bottom: 8, right: 8 },
  addPhotoBox: { flex: 1, height: 110, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addPhotoText: { fontSize: 7, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },
  emptyPhotoBox: { flex: 1, height: 110, backgroundColor: '#F8FAFC', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  reviewCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  reviewLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1, marginBottom: 10 },
  starsRow: { flexDirection: 'row', marginBottom: 15 },
  reviewText: { fontSize: 13, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 22 },

  tasksList: { marginTop: 15 },
  taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  taskText: { fontSize: 11, color: '#7A8C9E', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', height: 80, borderTopWidth: 1, borderTopColor: '#F0F4F8', position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0A192F', marginTop: 4 }
});
