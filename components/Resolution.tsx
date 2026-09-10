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

export default function Resolution() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.headerTitle}>Resolución</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>REPORTE RECIBIDO</Text>
        </View>

        <Text style={styles.title}>¿Qué deseas hacer con tu solicitud?</Text>
        <Text style={styles.subtitle}>EL SERVICIO #CK-2901 HA SIDO SUSPENDIDO TEMPORALMENTE. TÚ DECIDES CÓMO PROCEDER.</Text>

        {/* Card 1: Buscar Nuevo */}
        <TouchableOpacity 
          style={styles.actionCardDark}
          onPress={() => router.push('/search-tech' as any)}
        >
          <View style={styles.actionIconDark}>
            <Feather name="search" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitleDark}>BUSCAR NUEVO TÉCNICO</Text>
            <Text style={styles.actionSubtitleDark}>REASIGNAREMOS TU PC A OTRO EXPERTO PRIORITARIAMENTE.</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2: Cancelar */}
        <TouchableOpacity 
          style={styles.actionCardLight}
          onPress={() => router.push('/client-dashboard')}
        >
          <View style={styles.actionIconLight}>
            <Feather name="x" size={16} color="#7A8C9E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitleLight}>CANCELAR SOLICITUD</Text>
            <Text style={styles.actionSubtitleLight}>CERRAR EL REPORTE. NO SE REALIZARÁ NINGÚN CARGO.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportLink} onPress={() => router.push('/support-chat')}>
          <Feather name="life-buoy" size={12} color="#7A8C9E" style={{ marginRight: 8 }} />
          <Text style={styles.supportLinkText}>HABLAR CON UN ASESOR DE CLICK&SERVE</Text>
        </TouchableOpacity>

      </ScrollView>
      
      {/* Footer Shield */}
      <View style={styles.footer}>
        <View style={styles.shieldCard}>
          <Feather name="shield" size={16} color="#9CA8B6" style={{ marginRight: 15 }} />
          <Text style={styles.shieldText}>
            GARANTÍA DE SATISFACCIÓN. SI EL TÉCNICO NO SE PRESENTA, TU PAGO ESTÁ PROTEGIDO Y NO SE LIBERARÁ BAJO NINGUNA CIRCUNSTANCIA.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingBottom: 40, alignItems: 'center' },
  
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', alignSelf: 'flex-start', marginBottom: 50 },
  
  statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 20 },
  statusBadgeText: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  
  title: { fontSize: 20, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, textAlign: 'center', lineHeight: 14, marginBottom: 40 },
  
  actionCardDark: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A192F', borderRadius: 8, padding: 25, width: '100%', marginBottom: 15, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5 },
  actionIconDark: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionTitleDark: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5, marginBottom: 6 },
  actionSubtitleDark: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1, lineHeight: 12 },

  actionCardLight: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 25, width: '100%', marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  actionIconLight: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionTitleLight: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 6 },
  actionSubtitleLight: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1, lineHeight: 12 },

  supportLink: { flexDirection: 'row', alignItems: 'center' },
  supportLinkText: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5 },

  footer: { paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, backgroundColor: '#FFFFFF' },
  shieldCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 20, borderRadius: 8 },
  shieldText: { flex: 1, fontSize: 7, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1, lineHeight: 12 },
});
