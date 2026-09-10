import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
// 1. Importamos useLocalSearchParams
import { useRouter } from 'expo-router';
import { useAuth, api } from './context/AuthContext';
import { Feather } from '@expo/vector-icons';

export default function ChangePassword() {
  const router = useRouter();
  const { user } = useAuth();
  
  const email = user?.correo;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentError, setCurrentError] = useState('');

  const passwordsMatch = newPassword === confirmPassword;
  const showMatchError = confirmPassword.length > 0 && !passwordsMatch;

  const handleChangePassword = async () => {
    setCurrentError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Atención', 'Por favor, llena todos los campos.');
      return;
    }
    if (!email) {
      Alert.alert('Error', 'No se pudo identificar tu sesión. Por favor, cierra sesión y vuelve a entrar.');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Atención', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // Usamos el cliente api que ya tiene la URL base y maneja los interceptores de 401
      const response = await api.post('/api/update-password', {
        email: email, 
        currentPassword: currentPassword,
        newPassword: newPassword
      });

      const { token: newToken } = response.data;
      if (newToken) {
        await AsyncStorage.setItem('@user_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      }

      Alert.alert(
        '¡Actualizada!', 
        'Tu contraseña se ha cambiado correctamente.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        // Podría ser error global de sesión expirada, pero lo maneja el interceptor.
        // Si es por contraseña actual incorrecta, el backend debería devolver otro status (ej. 400 o 403)
        // Pero si tu backend usa 401 para "contraseña actual incorrecta", colisionará con el interceptor global.
        setCurrentError('contraseña actual incorrecta');
      } else {
        Alert.alert('Error', error.response?.data?.error || 'Hubo un problema al actualizar la contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={24} color="#0A192F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
          <View style={{ width: 34 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Ingresa tu contraseña actual y define una nueva clave de acceso seguro.</Text>

          {/* CONTRASEÑA ACTUAL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA ACTUAL</Text>
            <View style={[styles.passwordContainer, currentError ? styles.inputErrorBorder : null]}>
              <TextInput
                style={styles.input}
                placeholder="********"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setCurrentError('');
                }}
                selectionColor="#0A192F"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <Feather name={showCurrent ? "eye" : "eye-off"} size={20} color="#7A8C9E" />
              </TouchableOpacity>
            </View>
            {currentError ? <Text style={styles.errorText}>{currentError}</Text> : null}
          </View>

          {/* NUEVA CONTRASEÑA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="********"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                selectionColor="#0A192F"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Feather name={showNew ? "eye" : "eye-off"} size={20} color="#7A8C9E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* REPETIR NUEVA CONTRASEÑA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>REPETIR NUEVA CONTRASEÑA</Text>
            <View style={[styles.passwordContainer, showMatchError ? styles.inputErrorBorder : null]}>
              <TextInput
                style={styles.input}
                placeholder="********"
                secureTextEntry={!showNew}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                selectionColor="#0A192F"
              />
            </View>
            {showMatchError ? <Text style={styles.errorText}>Las contraseñas no coinciden.</Text> : null}
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleChangePassword} 
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>ACTUALIZAR CONTRASEÑA</Text>}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A192F', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  iconButton: { padding: 5 },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 30 },
  subtitle: { fontSize: 14, color: '#7A8C9E', lineHeight: 22, marginBottom: 35 },
  
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 10, color: '#5B708B', fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#D1D9E0' },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#0A192F' },
  
  // Estilos de Error
  inputErrorBorder: { borderBottomColor: '#FF6B6B', borderBottomWidth: 2 },
  errorText: { color: '#FF6B6B', fontSize: 12, fontWeight: '600', marginTop: 8 },

  button: { backgroundColor: '#0A192F', paddingVertical: 18, borderRadius: 2, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#5B708B' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 }
});