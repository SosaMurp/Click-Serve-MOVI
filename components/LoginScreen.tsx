import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, api } from './context/AuthContext';
import { theme } from './theme';
import { AppInput } from './common/AppInput';
import { AppButton } from './common/AppButton';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/login', { email, password });
      const data = response.data;

      setIsLoading(false);
      
      Alert.alert(
        'Éxito', 
        'Inicio de sesión correcto', 
        [
          { 
            text: 'OK', 
            onPress: () => {
              login(data.usuario, data.token);
            } 
          }
        ]
      );

    } catch (error: any) {
      setIsLoading(false);
      console.error(error);
      const errMessage = error.response?.data?.error || 'Credenciales incorrectas o problemas de conexión.';
      Alert.alert('Error de Inicio de Sesión', errMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Click & Serve</Text>
          <Text style={styles.subtitle}>LÁZARO CÁRDENAS</Text>
        </View>

        <View style={styles.card}>
          <AppInput
            label="EMAIL"
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
          />

          <AppInput
            label="CONTRASEÑA"
            placeholder="********"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
          />

          <TouchableOpacity style={styles.forgotContainer} onPress={() => router.push('/request-recovery' as any)}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <AppButton
            title="INICIAR SESIÓN"
            onPress={handleLogin}
            isLoading={isLoading}
          />

          <TouchableOpacity style={styles.registerContainer} onPress={() => router.push('/register' as any)}>
            <Text style={styles.registerText}>¿No tienes cuenta? Crea una aquí</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.md },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monospace,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  forgotContainer: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.fonts.body },
  registerContainer: { alignItems: 'center', marginTop: 16 },
  registerText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500', fontFamily: theme.fonts.body },
  errorText: { color: theme.colors.error, fontSize: 13, textAlign: 'center', marginBottom: 15, fontWeight: 'bold', fontFamily: theme.fonts.body },
});