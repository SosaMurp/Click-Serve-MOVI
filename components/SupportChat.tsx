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

export default function SupportChat() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#0A192F" />
          </TouchableOpacity>
          <View style={styles.avatarCS}>
            <Text style={styles.avatarCSText}>CS</Text>
            <View style={styles.onlineBadge} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Soporte Click&Serve</Text>
            <Text style={styles.headerSubtitle}>Agente en línea • Responde en {'<'} 2 min</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Feather name="more-vertical" size={20} color="#9CA8B6" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.chatContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>18:01</Text>
          </View>

          {/* System Message */}
          <View style={styles.systemMessageContainer}>
            <View style={styles.botIconWrapper}>
              <Feather name="message-square" size={16} color="#0A192F" />
            </View>
            <Text style={styles.systemMessageText}>
              Estás hablando con nuestro equipo de asistencia de Lázaro Cárdenas. Cuéntanos cómo podemos ayudarte hoy.
            </Text>
          </View>

          {/* Agent Message */}
          <View style={styles.messageRowLeft}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>A</Text>
            </View>
            <View>
              <View style={styles.messageBubbleLeft}>
                <Text style={styles.messageTextLeft}>
                  Hola, soy el agente asignado a tu caso. ¿Tienes algún problema con un servicio reciente o una duda sobre la plataforma?
                </Text>
              </View>
              <Text style={styles.messageTimeLeft}>18:14 AM</Text>
            </View>
          </View>

          {/* User Message */}
          <View style={styles.messageRowRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.messageBubbleRight}>
                <Text style={styles.messageTextRight}>
                  Hola, el técnico Carlos V. me acaba de contactar para pedirme un cobro extra por ir a Guacamayas. ¿Esto es correcto?
                </Text>
              </View>
              <View style={styles.timeRowRight}>
                <Text style={styles.messageTimeRight}>18:16 AM</Text>
                <Feather name="check" size={12} color="#0A192F" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>

          {/* Typing Indicator */}
          <View style={styles.messageRowLeft}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>A</Text>
            </View>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>• • •</Text>
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
          <Text style={styles.secureFooterText}>SEGURIDAD CLICK&SERVE • CHAT ENCRIPTADO</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 5, marginRight: 10, marginLeft: -5 },
  avatarCS: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  avatarCSText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#0A192F' },
  headerSubtitle: { fontSize: 9, fontWeight: '700', color: '#10B981', marginTop: 2 },
  
  chatContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  timestampContainer: { alignItems: 'center', marginBottom: 20 },
  timestampText: { fontSize: 10, fontWeight: '700', color: '#9CA8B6', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  
  systemMessageContainer: { alignItems: 'center', marginBottom: 30 },
  botIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  systemMessageText: { fontSize: 11, color: '#7A8C9E', textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  
  messageRowLeft: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20, maxWidth: '85%' },
  agentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  agentAvatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  messageBubbleLeft: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, borderRadius: 16, borderBottomLeftRadius: 4 },
  messageTextLeft: { fontSize: 13, color: '#0A192F', lineHeight: 20 },
  messageTimeLeft: { fontSize: 9, color: '#9CA8B6', fontWeight: '700', marginTop: 6, marginLeft: 5 },
  
  messageRowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  messageBubbleRight: { backgroundColor: '#0A192F', padding: 15, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '85%' },
  messageTextRight: { fontSize: 13, color: '#FFFFFF', lineHeight: 20 },
  timeRowRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 6, marginRight: 5 },
  messageTimeRight: { fontSize: 9, color: '#9CA8B6', fontWeight: '700' },
  
  typingBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 16, borderBottomLeftRadius: 4 },
  typingText: { fontSize: 16, color: '#9CA8B6', letterSpacing: 2 },

  inputAreaWrapper: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 15, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 24, paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  attachButton: { padding: 5, marginRight: 5 },
  textInput: { flex: 1, fontSize: 14, color: '#0A192F', paddingVertical: 8 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  secureFooterText: { fontSize: 8, fontWeight: '800', color: '#9CA8B6', letterSpacing: 1, textAlign: 'center' },
});
