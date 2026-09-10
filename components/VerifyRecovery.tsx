import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
// Agregamos useLocalSearchParams para recibir el correo
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from './context/AuthContext';

export default function VerifyRecovery() {
  const router = useRouter();
  // Recuperamos el correo que nos pasó RequestRecovery
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'No se encontró el correo electrónico para el reenvío.');
      return;
    }
    setIsResending(true);
    try {
      await api.post('/api/request-recovery', {
        email: email.trim()
      });
      Alert.alert('¡Código reenviado!', 'Revisa tu bandeja de entrada. Los códigos anteriores ya no funcionarán.');
      setCode('');
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || 'No pudimos comunicarnos con el servidor.';
      Alert.alert('Error de conexión', errMsg);
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCode(cleaned);
    if (cleaned.length === 4) {
      handleVerify(cleaned);
    }
  };

  const handleVerify = async (codeToVerify?: any) => {
    const activeCode = typeof codeToVerify === 'string' ? codeToVerify : code;
    // Bloqueamos si no tiene exactamente 4 dígitos
    if (activeCode.length < 4) return;
    setIsLoading(true);

    try {
      // Hacemos la petición utilizando la instancia centralizada de Axios
      const response = await api.post('/api/verify-recovery', {
        email,
        token: activeCode.trim()
      });

      const data = response.data;

      // Si el código es correcto, avanzamos al paso final pasando el correo
      router.push({
        pathname: '/reset-password',
        params: { email }
      } as any);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || 'Hubo un problema de conexión con el servidor.';
      Alert.alert('Código Incorrecto', errMsg);
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
          <Text style={styles.title}>Ingresa el código</Text>
          {/* Mostramos dinámicamente a dónde se envió el código */}
          <Text style={styles.subtitle}>Escribe el código de seguridad enviado a {email || 'tu correo'}.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CÓDIGO DE 4 DÍGITOS</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              keyboardType="number-pad"
              maxLength={4} // 👈 Restringido a 4 dígitos
              value={code}
              onChangeText={handleCodeChange}
              selectionColor="#0A192F"
              textAlign="center"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, (isLoading || code.length < 4) && styles.buttonDisabled]} 
            onPress={handleVerify} 
            disabled={isLoading || code.length < 4}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>VERIFICAR CÓDIGO</Text>}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendTextSub}>¿NO RECIBISTE NADA?</Text>
            <TouchableOpacity onPress={handleResendCode} disabled={isResending || isLoading}>
              {isResending ? (
                <Text style={[styles.resendTextMain, { color: '#7A8C9E' }]}>Enviando código...</Text>
              ) : (
                <Text style={styles.resendTextMain}>Reenviar Código</Text>
              )}
            </TouchableOpacity>
          </View>
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
  title: { fontSize: 32, fontWeight: '700', color: '#0A192F', marginBottom: 15 },
  subtitle: { fontSize: 15, color: '#7A8C9E', lineHeight: 24, marginBottom: 40 },
  inputGroup: { marginBottom: 30 },
  label: { fontSize: 10, color: '#5B708B', fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, textAlign: 'center' },
  // Ajusté el fontSize y letterSpacing un poco para que los 4 dígitos se vean más robustos y centrados
  input: { borderBottomWidth: 2, borderBottomColor: '#0A192F', fontSize: 28, paddingVertical: 15, color: '#0A192F', fontWeight: 'bold', letterSpacing: 8 },
  button: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 2, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#5B708B' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },
  resendContainer: { alignItems: 'center', marginTop: 25 },
  resendTextSub: { color: '#B0BEC5', fontSize: 11, letterSpacing: 1, fontWeight: 'bold', marginBottom: 5 },
  resendTextMain: { color: '#0A192F', fontSize: 14, fontWeight: 'bold' }
});