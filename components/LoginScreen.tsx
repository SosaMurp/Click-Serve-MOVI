import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, api } from './context/AuthContext';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atención', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/login', { email, password });
      const data = response.data;

      // Si el backend solicita 2FA, redirigir a VerifyScreen pasando el correo
      if (data?.requires2FA) {
        setIsLoading(false);
        router.push({
          pathname: '/verify-screen',
          params: { userEmail: data.correo || email.trim().toLowerCase(), is2FA: 'true' }
        } as any);
        return;
      }

      if (response.status !== 200 || !data?.usuario || !data?.token) {
        throw new Error('El servidor no devolvió una sesión válida.');
      }

      await login(data.usuario, data.token);
      const destination = data.usuario.id_rol === 2 ? '/tech-dashboard' : '/client-dashboard';
      router.replace(destination as any);

    } catch (error: any) {
      setIsLoading(false);
      console.error(error);
      const errMessage = error.response?.data?.error || error.message || 'Credenciales incorrectas. Verifica tus datos e intenta nuevamente.';
      setErrorMessage(errMessage);
      Alert.alert('Error', errMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Imagen Ilustración en la parte superior con resizeMode="contain" */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/fondo.jpeg')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Título de la Aplicación */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Click & Serve</Text>
          <Text style={styles.subtitle}>LÁZARO CÁRDENAS</Text>
        </View>

        {/* Formulario en Tarjeta Blanco Sólido con Sombra Suave */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>INICIAR SESIÓN</Text>

          {/* Input Email */}
          <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={18} color="#0A192F" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA8B6"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
            />
          </View>

          {/* Input Password */}
          <Text style={styles.inputLabel}>CONTRASEÑA</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={18} color="#0A192F" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#9CA8B6"
              secureTextEntry
              value={password}
              onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
            />
          </View>

          <TouchableOpacity style={styles.forgotContainer} onPress={() => router.push('/request-recovery' as any)}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Alerta de Error en Naranja Vibrante */}
          {errorMessage ? (
            <View style={styles.alertBox}>
              <Feather name="alert-circle" size={16} color="#FF6B1A" style={{ marginRight: 8 }} />
              <Text style={styles.alertText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Botón Principal Naranja Vibrante */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>INGRESAR A LA PLATAFORMA</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Link para Registrarse */}
          <TouchableOpacity style={styles.registerContainer} onPress={() => router.push('/register' as any)}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={styles.registerHighlight}>Regístrate gratis</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  
  imageContainer: { alignItems: 'center', marginBottom: 10 },
  heroImage: { width: '100%', height: 160, borderRadius: 12 },

  headerContainer: { alignItems: 'center', marginBottom: 20 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0A192F',
    letterSpacing: -0.5,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7A8C9E',
    letterSpacing: 2,
  },

  /* Tarjeta Blanco Sólido (#FFFFFF) con Sombra Suave (elevation: 2) */
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8EEF3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A192F',
    letterSpacing: 1.5,
    marginBottom: 18,
    textAlign: 'center',
  },

  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0A192F',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0A192F',
    fontWeight: '600',
  },

  forgotContainer: { alignItems: 'flex-end', marginBottom: 18 },
  forgotText: { color: '#7A8C9E', fontSize: 11, fontWeight: '700' },

  /* Alert Naranja Vibrante */
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EC',
    borderWidth: 1,
    borderColor: '#FF6B1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  alertText: { flex: 1, fontSize: 11, color: '#D94800', fontWeight: '800', lineHeight: 15 },

  /* Botón Naranja Vibrante */
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B1A',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: { opacity: 0.7 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  registerContainer: { alignItems: 'center', marginTop: 18 },
  registerText: { color: '#7A8C9E', fontSize: 12, fontWeight: '600' },
  registerHighlight: { color: '#FF6B1A', fontWeight: '800' },
});