import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from './context/AuthContext';

export default function RequestRecovery() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendToken = async () => {
    // Validación básica para evitar envíos vacíos o sin formato de correo
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Atención', 'Por favor ingresa un correo electrónico válido.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Petición utilizando la instancia centralizada de Axios
      const response = await api.post('/api/request-recovery', {
        email: email.trim()
      });

      const data = response.data;

      // Redireccionamos pasando únicamente el email a la siguiente pantalla
      router.push({
        pathname: '/verify-recovery',
        params: { email: email.trim() }
      } as any);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || 'Problema de conexión con el servidor.';
      Alert.alert('Atención', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#0A192F" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Recuperar Cuenta</Text>
          <Text style={styles.subtitle}>Ingresa tu correo electrónico y te enviaremos un código de seguridad de 4 dígitos.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#0A192F"
            />
          </View>

          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSendToken} disabled={isLoading || email.length < 5}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 25 },
  backButton: { marginTop: 20, width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', marginTop: -40 },
  title: { fontSize: 32, fontWeight: '700', color: '#0A192F', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#7A8C9E', marginBottom: 40, lineHeight: 22 },
  inputGroup: { marginBottom: 30 },
  label: { fontSize: 10, color: '#5B708B', fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  input: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', fontSize: 16, paddingVertical: 12, color: '#0A192F' },
  button: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 2, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#5B708B' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 }
});