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

export default function TechChat() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={styles.headerTechInfo}>
          <View style={styles.avatarWrapper}>
            <View style={styles.techAvatar} />
            <View style={styles.onlineBadge} />
          </View>
          <View>
            <Text style={styles.headerTitle}>TÉC. ROBERTO G.</Text>
            <Text style={styles.headerSubtitle}>EN LÍNEA AHORA</Text>
          </View>
        </View>
      </View>

      {/* Appointment Banner */}
      <View style={styles.appointmentBanner}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.bannerLabel}>CITA PROGRAMADA:</Text>
          <Text style={styles.bannerValue}>15 FEB. • 12:30 PM</Text>
        </View>
        <Text style={styles.bannerService}>SOPORTE TÉCNICO</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.chatContainer} showsVerticalScrollIndicator={false}>
          
          {/* Tech Message */}
          <View style={styles.messageRowLeft}>
            <View style={styles.messageBubbleLeft}>
              <Text style={styles.messageTextLeft}>
                Hola Carlos, tuve un retraso en el servicio anterior. ¿Podríamos mover nuestra cita para las 12:30 PM?
              </Text>
            </View>
            <Text style={styles.messageTimeLeft}>10:14 AM</Text>
          </View>

          {/* Proposal Card */}
          <View style={styles.proposalCard}>
            <Text style={styles.proposalTitle}>PROPUESTA DE CAMBIO</Text>
            <View style={styles.proposalRow}>
              <Text style={styles.proposalLabel}>NUEVA</Text>
              <Feather name="arrow-right" size={12} color="#0A192F" style={{ marginHorizontal: 10 }} />
              <View style={styles.proposalValueBox}>
                <Text style={styles.proposalValueText}>12:30 PM</Text>
              </View>
            </View>
            <View style={styles.proposalActions}>
              <TouchableOpacity style={styles.proposalBtnPrimary}>
                <Text style={styles.proposalBtnPrimaryText}>CONFIRMAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.proposalBtnSecondary}>
                <Text style={styles.proposalBtnSecondaryText}>SUGERIR OTRA</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Message */}
          <View style={styles.messageRowRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.messageBubbleRight}>
                <Text style={styles.messageTextRight}>
                  Sin problema Roberto, te veo a esa hora.
                </Text>
              </View>
              <View style={styles.timeRowRight}>
                <Text style={styles.messageTimeRight}>10:16 AM</Text>
                <Feather name="check" size={12} color="#0A192F" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputAreaWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Feather name="paperclip" size={20} color="#7A8C9E" />
            </TouchableOpacity>
            <TextInput 
              style={styles.textInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#9CA8B6"
            />
            <TouchableOpacity style={styles.sendButton}>
              <Feather name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  backButton: { padding: 5, marginRight: 10, marginLeft: -5 },
  headerTechInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  techAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E1E8ED' },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  headerSubtitle: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 1.5, marginTop: 2 },
  
  appointmentBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A192F', paddingHorizontal: 20, paddingVertical: 12 },
  bannerLabel: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1, marginRight: 8 },
  bannerValue: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  bannerService: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1 },

  chatContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  
  messageRowLeft: { marginBottom: 20, maxWidth: '85%' },
  messageBubbleLeft: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, borderRadius: 8 },
  messageTextLeft: { fontSize: 13, color: '#0A192F', lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  messageTimeLeft: { fontSize: 9, color: '#9CA8B6', fontWeight: '700', marginTop: 6, marginLeft: 5 },
  
  proposalCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 20, marginBottom: 30, alignSelf: 'center', width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  proposalTitle: { fontSize: 8, fontWeight: '800', color: '#7A8C9E', letterSpacing: 1.5, textAlign: 'center', marginBottom: 15 },
  proposalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  proposalLabel: { fontSize: 10, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1 },
  proposalValueBox: { borderBottomWidth: 1, borderBottomColor: '#0A192F', paddingBottom: 2 },
  proposalValueText: { fontSize: 14, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  proposalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  proposalBtnPrimary: { flex: 1, backgroundColor: '#0A192F', paddingVertical: 12, borderRadius: 4, alignItems: 'center', marginRight: 10 },
  proposalBtnPrimaryText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  proposalBtnSecondary: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 12, borderRadius: 4, alignItems: 'center' },
  proposalBtnSecondaryText: { color: '#7A8C9E', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },

  messageRowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  messageBubbleRight: { backgroundColor: '#0A192F', padding: 15, borderRadius: 8, maxWidth: '85%' },
  messageTextRight: { fontSize: 13, color: '#FFFFFF', lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  timeRowRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 6, marginRight: 5 },
  messageTimeRight: { fontSize: 9, color: '#9CA8B6', fontWeight: '700' },

  inputAreaWrapper: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 15, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  attachButton: { padding: 5, marginRight: 5 },
  textInput: { flex: 1, fontSize: 14, color: '#0A192F', paddingVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  sendButton: { width: 36, height: 36, borderRadius: 4, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
