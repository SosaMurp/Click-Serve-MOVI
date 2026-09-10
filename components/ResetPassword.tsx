import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
// Importamos useLocalSearchParams para atrapar el correo
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from './context/AuthContext';

export default function ResetPassword() {
  const router = useRouter();
  // Recuperamos el correo enviado por la pantalla de verificación
  const { email } = useLocalSearchParams<{ email: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    // 1. Validaciones básicas del lado del cliente
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, llena ambos campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Tu contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Petición utilizando la instancia centralizada de Axios
      const response = await api.post('/api/reset-password', {
        email: email, 
        newPassword: password 
      });

      const data = response.data;

      // 3. Éxito total: Contraseña cambiada en DB
      Alert.alert(
        '¡Éxito!', 
        'Tu contraseña ha sido actualizada correctamente.',
        [{ text: 'Ir al Login', onPress: () => router.replace('/') }] // Asegúrate de que '/' sea tu ruta de Login
      );
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || 'No se pudo actualizar la contraseña o hay un problema de conexión.';
      Alert.alert('Error', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Nueva Contraseña</Text>
          <Text style={styles.subtitle}>Crea una contraseña segura para tu cuenta.</Text>

          {/* Campo: Nueva Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="********"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                selectionColor="#0A192F"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#7A8C9E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo: Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="********"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                selectionColor="#0A192F"
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleReset} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>GUARDAR CONTRASEÑA</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 30, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 10 },
  title: { fontSize: 26, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#7A8C9E', lineHeight: 22, marginBottom: 35 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 10, color: '#5B708B', fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#D1D9E0' },
  input: { flex: 1, fontSize: 16, paddingVertical: 10, color: '#0A192F' },
  button: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 2, alignItems: 'center', marginTop: 15 },
  buttonDisabled: { backgroundColor: '#5B708B' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5 }
});