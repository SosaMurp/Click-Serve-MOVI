import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechRateClient() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Experiencia con el Cliente</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Client Profile */}
          <View style={styles.clientProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JP</Text>
            </View>
            <Text style={styles.clientName}>Juan Pérez</Text>
            <Text style={styles.serviceInfo}>SERVICIO FINALIZADO • #CK-2901</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>CALIFICA AL CLIENTE</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4].map(star => (
                <Feather key={star} name="star" size={24} color="#0A192F" style={styles.starIcon} />
              ))}
              <Feather name="star" size={24} color="#E2E8F0" style={styles.starIcon} />
            </View>
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsLabel}>COMENTARIOS SOBRE EL CLIENTE</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.textInput}
                multiline
                placeholder="Ej: Trato amable, descripción precisa de la falla, pago puntual..."
                placeholderTextColor="#9CA8B6"
              />
            </View>
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => router.push('/tech-dashboard')}
          >
            <Text style={styles.submitButtonText}>ENVIAR CALIFICACIÓN Y CERRAR</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            ESTA RESEÑA AYUDA A LA COMUNIDAD DE TÉCNICOS EN LÁZARO CÁRDENAS.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', paddingVertical: 25 },
  headerTitle: { fontSize: 20, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

  content: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 40 },
  
  clientProfile: { alignItems: 'center', marginBottom: 50 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  clientName: { fontSize: 18, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 8 },
  serviceInfo: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5 },

  ratingSection: { alignItems: 'center', marginBottom: 50 },
  ratingLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 2, marginBottom: 20 },
  starsRow: { flexDirection: 'row' },
  starIcon: { marginHorizontal: 8 },

  commentsSection: { marginBottom: 20 },
  commentsLabel: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 15 },
  inputContainer: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 20, minHeight: 120 },
  textInput: { flex: 1, fontSize: 12, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', textAlignVertical: 'top' },

  footer: { paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, paddingTop: 20 },
  submitButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center', marginBottom: 20, shadowColor: '#0A192F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  submitButtonText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  footerNote: { fontSize: 7, fontWeight: '800', color: '#E2E8F0', letterSpacing: 1, textAlign: 'center' },
});
