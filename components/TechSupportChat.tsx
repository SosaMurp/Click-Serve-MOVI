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

export default function TechSupportChat() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.headerTitle}>Centro de Soporte Operativo</Text>
          <View style={styles.agentStatus}>
            <View style={styles.agentDot} />
            <Text style={styles.agentStatusText}>AGENTE ASIGNADO</Text>
          </View>
        </View>
        <View style={styles.ticketBadge}>
          <Text style={styles.ticketBadgeText}>#SUP-0026</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.chatContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.warningBanner}>
            <Feather name="info" size={14} color="#3B82F6" style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={styles.warningText}>
              Esta conversación está siendo grabada para fines de auditoría y calidad en el servicio.
            </Text>
          </View>
          
          {/* Support Agent Message */}
          <View style={styles.messageRowLeft}>
            <View style={styles.avatarLeft}>
              <Text style={styles.avatarText}>CS</Text>
            </View>
            <View>
              <View style={styles.messageBubbleLeft}>
                <Text style={styles.messageTextLeft}>
                  Hola Roberto, veo que estás en la zona de <Text style={{ fontWeight: '700' }}>Guacamayas</Text>. ¿En qué podemos apoyarte con tu servicio actual?
                </Text>
              </View>
              <Text style={styles.messageTimeLeft}>12:38 PM</Text>
            </View>
          </View>

          {/* Tech Message */}
          <View style={styles.messageRowRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.messageBubbleRight}>
                <Text style={styles.messageTextRight}>
                  "Tengo un problema con el cobro de traslado. El cliente dice que no debería pagar extra pero la distancia excede el radio base."
                </Text>
              </View>
              <View style={styles.timeRowRight}>
                <Text style={styles.messageTimeRight}>Enviado</Text>
                <Feather name="check" size={12} color="#9CA8B6" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>

          {/* Typing Indicator */}
          <View style={styles.messageRowLeft}>
            <View style={styles.avatarLeftTyping}>
              <Text style={styles.avatarText}>CS</Text>
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>

        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputAreaWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Feather name="camera" size={20} color="#9CA8B6" />
            </TouchableOpacity>
            <TextInput 
              style={styles.textInput}
              placeholder="Describe el problema en sitio..."
              placeholderTextColor="#9CA8B6"
            />
            <TouchableOpacity style={styles.sendButton}>
              <Feather name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.escalateButton}>
            <Feather name="alert-triangle" size={14} color="#FF6B6B" style={{ marginRight: 8 }} />
            <Text style={styles.escalateButtonText}>ESCALAR A EMERGENCIA</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingBottom: 20, backgroundColor: '#0A192F' },
  backButton: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  agentStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  agentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  agentStatusText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1.5 },
  ticketBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  ticketBadgeText: { fontSize: 7, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
  
  chatContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  
  warningBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', borderRadius: 8, padding: 15, marginBottom: 30 },
  warningText: { flex: 1, fontSize: 10, color: '#3B82F6', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', lineHeight: 16 },

  messageRowLeft: { flexDirection: 'row', marginBottom: 25, maxWidth: '85%' },
  avatarLeft: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 5 },
  avatarLeftTyping: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7A8C9E', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  messageBubbleLeft: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', padding: 20, borderRadius: 8, borderTopLeftRadius: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  messageTextLeft: { fontSize: 13, color: '#0A192F', lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  messageTimeLeft: { fontSize: 8, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1, marginTop: 8, marginLeft: 5 },
  
  messageRowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 25 },
  messageBubbleRight: { backgroundColor: '#0A192F', padding: 20, borderRadius: 8, borderTopRightRadius: 0, maxWidth: '85%', shadowColor: '#0A192F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  messageTextRight: { fontSize: 13, color: '#FFFFFF', lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  timeRowRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, marginRight: 5 },
  messageTimeRight: { fontSize: 8, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1 },

  typingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, borderTopLeftRadius: 0 },
  typingDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#9CA8B6', marginHorizontal: 2 },

  inputAreaWrapper: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  attachButton: { padding: 5, marginRight: 10 },
  textInput: { flex: 1, fontSize: 13, color: '#0A192F', paddingVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  sendButton: { width: 36, height: 36, borderRadius: 4, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  
  escalateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F5', paddingVertical: 15, borderRadius: 4 },
  escalateButtonText: { fontSize: 9, fontWeight: '800', color: '#FF6B6B', letterSpacing: 1.5 },
});
