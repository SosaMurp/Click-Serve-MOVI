import React, { useState } from 'react';
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

export default function ServiceFinished() {
  const router = useRouter();
  const [rating, setRating] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.headerTitle}>Servicio Finalizado</Text>

          {/* Tech Avatar */}
          <View style={styles.techContainer}>
            <View style={styles.techAvatar} />
            <Text style={styles.techName}>Téc. Roberto G.</Text>
            <Text style={styles.techRole}>SOPORTE TÉCNICO REALIZADO</Text>
          </View>

          {/* Receipt Card */}
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>DETALLE DEL CARGO</Text>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>MANO DE OBRA</Text>
              <Text style={styles.receiptValue}>$450.00</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>REFACCIONES (FUSIBLE)</Text>
              <Text style={styles.receiptValue}>$85.00</Text>
            </View>

            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>TOTAL PAGADO</Text>
              <Text style={styles.receiptTotalValue}>$535.00</Text>
            </View>

            <View style={styles.paymentMethodRow}>
              <Feather name="credit-card" size={12} color="#9CA8B6" style={{ marginRight: 6 }} />
              <Text style={styles.paymentMethodText}>COBRADO A VISA **** 4242</Text>
            </View>
          </View>

          {/* Review Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>¿Cómo fue tu experiencia?</Text>
            <Text style={styles.reviewSubtitle}>TU RESEÑA AYUDA A LA COMUNIDAD</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Feather 
                    name="star" 
                    size={32} 
                    color={star <= rating ? "#0A192F" : "#D1D9E0"} 
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput 
              style={styles.textArea} 
              placeholder="Escribe un comentario opcional..."
              placeholderTextColor="#9CA8B6"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

        </ScrollView>
        
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={() => router.replace('/client-dashboard')}
          >
            <Text style={styles.finishButtonText}>ENVIAR Y FINALIZAR</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingBottom: 40 },
  
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', marginBottom: 30 },
  
  techContainer: { alignItems: 'center', marginBottom: 40 },
  techAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E1E8ED', marginBottom: 15 },
  techName: { fontSize: 18, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 6 },
  techRole: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, textTransform: 'uppercase' },

  receiptCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 8, padding: 25, marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  receiptTitle: { fontSize: 8, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5, marginBottom: 25 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  receiptLabel: { fontSize: 9, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },
  receiptValue: { fontSize: 10, fontWeight: '800', color: '#0A192F' },
  receiptTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 25, borderTopWidth: 1, borderTopColor: '#F0F4F8', marginBottom: 20 },
  receiptTotalLabel: { fontSize: 10, fontWeight: '800', color: '#0A192F', letterSpacing: 1.5 },
  receiptTotalValue: { fontSize: 18, fontWeight: '800', color: '#0A192F' },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 4 },
  paymentMethodText: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },

  reviewSection: { alignItems: 'center' },
  reviewTitle: { fontSize: 22, fontWeight: '800', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', marginBottom: 10 },
  reviewSubtitle: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1.5, marginBottom: 30 },
  starsContainer: { flexDirection: 'row', marginBottom: 30 },
  starIcon: { marginHorizontal: 8 },
  textArea: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', paddingVertical: 15, fontSize: 14, color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },

  footer: { paddingHorizontal: 25, paddingVertical: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  finishButton: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 4, alignItems: 'center' },
  finishButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
