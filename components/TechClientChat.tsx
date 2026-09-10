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

export default function TechClientChat() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#0A192F" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JP</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>JUAN PÉREZ</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>CLIENTE • ONLINE</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <Feather name="calendar" size={20} color="#9CA8B6" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.chatContainer} showsVerticalScrollIndicator={false}>
          
          {/* Client Message */}
          <View style={styles.messageRowLeft}>
            <View>
              <View style={styles.messageBubbleLeft}>
                <Text style={styles.messageTextLeft}>
                  "Hola Roberto, ¿crees que te tome mucho tiempo? Necesito salir a las 2:00 PM."
                </Text>
              </View>
              <Text style={styles.messageTimeLeft}>10:50 AM</Text>
            </View>
          </View>

          {/* Tech Message */}
          <View style={styles.messageRowRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.messageBubbleRight}>
                <Text style={styles.messageTextRight}>
                  No te preocupes, Juan. Llego en 5 minutos y revisamos la fuente de inmediato.
                </Text>
              </View>
              <View style={styles.timeRowRight}>
                <Text style={styles.messageTimeRight}>10:52 AM</Text>
                <Feather name="check" size={12} color="#10B981" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputAreaWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Feather name="camera" size={20} color="#C4CDD5" />
            </TouchableOpacity>
            <TextInput 
              style={styles.textInput}
              placeholder="Escribe al cliente..."
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 5, marginLeft: -5 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 15 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7A8C9E', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  headerTitle: { fontSize: 11, fontWeight: '800', color: '#0A192F', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusText: { fontSize: 7, fontWeight: '800', color: '#10B981', letterSpacing: 1 },
  calendarButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center' },
  
  chatContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 },

  messageRowLeft: { flexDirection: 'row', marginBottom: 25, maxWidth: '85%' },
  messageBubbleLeft: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F4F8', padding: 20, borderRadius: 8, borderTopLeftRadius: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  messageTextLeft: { fontSize: 13, color: '#7A8C9E', lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  messageTimeLeft: { fontSize: 8, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1, marginTop: 8, marginLeft: 5 },
  
  messageRowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 25 },
  messageBubbleRight: { backgroundColor: '#0A192F', padding: 20, borderRadius: 8, borderTopRightRadius: 0, maxWidth: '85%', shadowColor: '#0A192F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  messageTextRight: { fontSize: 13, color: '#FFFFFF', lineHeight: 22 },
  timeRowRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, marginRight: 5 },
  messageTimeRight: { fontSize: 8, color: '#9CA8B6', fontWeight: '800', letterSpacing: 1 },

  inputAreaWrapper: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: '#F0F4F8' },
  attachButton: { padding: 5, marginRight: 10 },
  textInput: { flex: 1, fontSize: 13, color: '#0A192F', paddingVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic' },
  sendButton: { width: 36, height: 36, borderRadius: 4, backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
