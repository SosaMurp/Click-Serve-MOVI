import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const renderItem = ({ item: message }: { item: ChatMessage }) => {
    const mine = message.id_emisor === user?.id_usuario;
    return (
      <View style={[styles.messageRow, mine ? styles.mineRow : styles.theirRow]}>
        <View style={[styles.bubble, mine ? styles.mineBubble : styles.theirBubble]}>
          <Text style={mine ? styles.mineText : styles.theirText}>{message.mensaje}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat del Servicio</Text>
        <View style={styles.online}>
          <Text style={styles.onlineText}>ACTIVO</Text>
        </View>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          initialNumToRender={15}
          windowSize={5}
          contentContainerStyle={styles.chatContainer}
          ListEmptyComponent={<Text style={styles.empty}>Aún no hay mensajes en la conversación.</Text>}
        />
        <View style={styles.inputArea}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#A0AEC0"
            style={styles.input}
            onSubmitEditing={send}
          />
          <TouchableOpacity style={styles.sendButton} onPress={send}>
            <Feather name="send" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { flex: 1, color: '#1A202C', fontSize: 17, fontWeight: '800' },
  online: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  onlineText: { color: '#166534', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  chatContainer: { padding: 20, flexGrow: 1 },
  messageRow: { marginBottom: 12, maxWidth: '82%' },
  mineRow: { alignSelf: 'flex-end' },
  theirRow: { alignSelf: 'flex-start' },
  bubble: { padding: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  mineBubble: { backgroundColor: '#FF6B1A', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  mineText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  theirText: { color: '#2D3748', fontSize: 14, lineHeight: 20 },
  empty: { color: '#718096', textAlign: 'center', marginTop: 40, fontSize: 13 },
  inputArea: { flexDirection: 'row', padding: 14, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#1A202C', fontSize: 14 },
  sendButton: { width: 42, height: 42, marginLeft: 10, borderRadius: 21, backgroundColor: '#FF6B1A', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B1A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
});
