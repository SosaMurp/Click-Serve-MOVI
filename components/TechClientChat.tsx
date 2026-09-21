import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getChatMessages, getTechnicianRequests, ChatMessage, sendChatMessage } from '../services/requestsApi';
import { useAuth } from './context/AuthContext';

export default function TechClientChat() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const [requestId, setRequestId] = useState(id ? Number(id) : 0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  const load = useCallback(async () => {
    try {
      let currentId = requestId;
      if (!currentId) {
        const active = (await getTechnicianRequests()).find(item => ['ASIGNADA', 'EN_CAMINO', 'EN_PROCESO'].includes(item.estado));
        currentId = active?.id_solicitud || 0;
        if (currentId) setRequestId(currentId);
      }
      if (currentId) setMessages(await getChatMessages(currentId));
    } catch (error: any) {
      if (!messages.length) Alert.alert('Chat no disponible', error.response?.data?.error || 'No se pudo cargar la conversación.');
    }
  }, [requestId, messages.length]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  const send = async () => {
    const value = text.trim();
    if (!value || !requestId) return;
    try {
      const message = await sendChatMessage(requestId, value);
      setMessages(current => [...current, message]);
      setText('');
    } catch (error: any) {
      Alert.alert('No se pudo enviar', error.response?.data?.error || 'Intenta nuevamente.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Feather name="chevron-left" size={24} color="#0A192F" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Chat del servicio</Text>
        <View style={styles.online}><Text style={styles.onlineText}>ACTIVO</Text></View>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.chatContainer}>
          {messages.map(message => {
            const mine = message.id_emisor === user?.id_usuario;
            return <View key={message.id} style={[styles.messageRow, mine ? styles.mineRow : styles.theirRow]}>
              <View style={[styles.bubble, mine ? styles.mineBubble : styles.theirBubble]}><Text style={mine ? styles.mineText : styles.theirText}>{message.mensaje}</Text></View>
            </View>;
          })}
          {!messages.length && <Text style={styles.empty}>Aún no hay mensajes.</Text>}
        </ScrollView>
        <View style={styles.inputArea}>
          <TextInput value={text} onChangeText={setText} placeholder="Escribe un mensaje..." placeholderTextColor="#9CA8B6" style={styles.input} onSubmitEditing={send} />
          <TouchableOpacity style={styles.sendButton} onPress={send}><Feather name="send" size={17} color="#FFFFFF" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { flex: 1, color: '#0A192F', fontSize: 17, fontWeight: '800' },
  online: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5 },
  onlineText: { color: '#15803D', fontSize: 8, fontWeight: '800' },
  chatContainer: { padding: 20, flexGrow: 1 },
  messageRow: { marginBottom: 12, maxWidth: '82%' },
  mineRow: { alignSelf: 'flex-end' },
  theirRow: { alignSelf: 'flex-start' },
  bubble: { padding: 13, borderRadius: 10 },
  mineBubble: { backgroundColor: '#0A192F', borderTopRightRadius: 2 },
  theirBubble: { backgroundColor: '#F1F5F9', borderTopLeftRadius: 2 },
  mineText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  theirText: { color: '#334155', fontSize: 14, lineHeight: 20 },
  empty: { color: '#9CA8B6', textAlign: 'center', marginTop: 40 },
  inputArea: { flexDirection: 'row', padding: 14, borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 14, color: '#0A192F' },
  sendButton: { width: 44, height: 44, marginLeft: 8, borderRadius: 8, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center' },
});
