import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TechRateClient() {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [comentarios, setComentarios] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        '¡Calificación registrada!',
        'Tu reseña ha sido guardada y ayuda a la comunidad técnica.',
        [
          {
            text: 'Aceptar',
            onPress: () => router.replace('/tech-dashboard'),
          },
        ]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Experiencia con el Cliente</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Client Profile */}
          <View style={styles.clientProfileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JP</Text>
            </View>
            <Text style={styles.clientName}>Juan Pérez</Text>
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceInfo}>SERVICIO FINALIZADO • #CK-2901</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingSectionCard}>
            <Text style={styles.ratingLabel}>CALIFICA AL CLIENTE</Text>
            <Text style={styles.ratingSubtitle}>
              Evalúa aspectos como puntualidad, comunicación y condiciones del área de trabajo.
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.8}
                  style={styles.starTouch}
                >
                  <Feather
                    name="star"
                    size={32}
                    color={star <= rating ? '#FF6B1A' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comments */}
          <View style={styles.commentsCard}>
            <Text style={styles.commentsLabel}>COMENTARIOS SOBRE EL CLIENTE</Text>
            <TextInput 
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Ej: Trato muy amable, descripción precisa de la falla y pago puntual..."
              placeholderTextColor="#94A3B8"
              value={comentarios}
              onChangeText={setComentarios}
            />
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>ENVIAR Y FINALIZAR</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Esta reseña ayuda a la comunidad de técnicos en Lázaro Cárdenas.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { padding: 4, marginLeft: -4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  content: { padding: 20, gap: 16 },
  
  clientProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF6B1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  clientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  serviceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceInfo: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

  ratingSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' },
  ratingSubtitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18, marginBottom: 14, paddingHorizontal: 10 },
  starsRow: { flexDirection: 'row', gap: 6 },
  starTouch: { padding: 4 },

  commentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  commentsLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 13,
    lineHeight: 18,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  submitButton: {
    backgroundColor: '#FF6B1A',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  footerNote: { fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 14 },
});
