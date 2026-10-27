import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons'; 
import { api, useAuth } from './context/AuthContext'; 
import { theme } from './theme';
import { AppButton } from './common/AppButton';

export default function VerifyScreen() {
  const router = useRouter();
  const { userEmail, is2FA } = useLocalSearchParams();
  const { login } = useAuth();
  const isTwoFactor = is2FA === 'true' || is2FA === true; 
  
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [isResending, setIsResending] = useState(false); 
  const [isFocused, setIsFocused] = useState(true);
  const inputRef = useRef<TextInput>(null);

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCode(cleaned);
    setError(false); 
    if (cleaned.length === 4) {
      handleVerify(cleaned);
    }
  };

  const handleVerify = async (codeToVerify?: any) => {
    const activeCode = typeof codeToVerify === 'string' ? codeToVerify : code;
    if (activeCode.length < 4) {
      setError(true);
      return;
    }

    setIsLoading(true);
    setError(false);

    try {
      if (isTwoFactor) {
        const response = await api.post("/api/login/verify-2fa", {
          correo: userEmail,
          codigo: activeCode,
        });

        const data = response.data;
        if (!data?.usuario || !data?.token) {
          throw new Error("Respuesta inválida del servidor.");
        }

        setIsLoading(false);
        setSuccess(true);

        await login(data.usuario, data.token);
        const destination = data.usuario.id_rol === 2 ? "/tech-dashboard" : "/client-dashboard";

        setTimeout(() => {
          router.replace(destination as any);
        }, 1200);
      } else {
        await api.post("/api/verify-token", { email: userEmail, token: activeCode });

        setIsLoading(false);
        setSuccess(true);
        setTimeout(() => {
          router.replace("/" as any);
        }, 2500);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(true); 
      console.error(err);
      const errMsg = err.response?.data?.error || 'No se pudo conectar con el servidor.';
      Alert.alert('Error de conexión', errMsg);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await api.post('/api/resend-code', { email: userEmail });

      Alert.alert('¡Código enviado!', 'Revisa tu bandeja de entrada. Los códigos anteriores ya no funcionarán.');
      setCode('');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'No pudimos comunicarnos con el servidor.';
      Alert.alert('Error de conexión', errMsg);
    } finally {
      setIsResending(false);
    }
  };

  const renderCodeBox = (index: number) => {
    const digit = code[index] || ''; 
    const isCurrent = isFocused && (code.length === index || (index === 3 && code.length === 4));

    return (
      <View 
        key={index} 
        style={[
          styles.otpBox, 
          isCurrent && styles.otpBoxFocused, 
          error && styles.otpBoxError
        ]}
      >
        <Text style={[styles.otpText, !digit && styles.otpPlaceholderText]}>
          {digit || '—'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <View style={styles.iconContainer}>
          <Feather name="mail" size={28} color="#FF6B1A" />
        </View>

        <Text style={styles.title}>{isTwoFactor ? 'Verificación 2FA' : 'Verifica tu correo'}</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un código de 4 dígitos a{'\n'}
          <Text style={styles.boldEmail}>{userEmail ? userEmail : 'tu correo'}</Text>
        </Text>

        <View style={styles.card}>
          
          {success ? (
            <View style={styles.successContainer}>
              <Feather name="check-circle" size={50} color={theme.colors.success} style={{ marginBottom: 15 }} />
              <Text style={styles.successText}>¡Código válido!</Text>
              <Text style={styles.successSubtext}>Redirigiendo a Inicio de Sesión...</Text>
              <ActivityIndicator size="large" color="#FF6B1A" style={{ marginTop: 20 }} />
            </View>
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                style={styles.otpContainer}
              >
                {[0, 1, 2, 3].map(renderCodeBox)}

                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  caretHidden={true}
                  autoFocus={true}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              </TouchableOpacity>

              {error && <Text style={styles.errorText}>Código inválido o expirado.</Text>}

              <AppButton
                title="VERIFICAR CÓDIGO"
                onPress={() => handleVerify()}
                isLoading={isLoading}
                disabled={isResending}
                style={{ marginTop: 10, marginBottom: 25 }}
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendTextSub}>¿NO RECIBISTE NADA?</Text>
                <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
                  {isResending ? (
                    <Text style={[styles.resendTextMain, { color: theme.colors.textSecondary }]}>Enviando código...</Text>
                  ) : (
                    <Text style={styles.resendTextMain}>Reenviar Código</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>

        {!success && (
          <TouchableOpacity style={styles.backContainer} onPress={() => router.back()}>
            <Text style={styles.backText}>{isTwoFactor ? '← VOLVER AL INICIO DE SESIÓN' : '← VOLVER AL REGISTRO'}</Text>
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050D1A' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.md },
  iconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '700', color: '#FFFFFF', fontFamily: theme.fonts.heading, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, fontFamily: theme.fonts.body, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  boldEmail: { fontWeight: 'bold', color: '#FF6B1A', fontFamily: theme.fonts.body, fontStyle: 'italic' },
  card: { backgroundColor: '#0F1E36', borderWidth: 1, borderColor: '#1E293B', borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3, marginBottom: 30 },
  
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, position: 'relative', width: '100%' },
  otpBox: { 
    flex: 1, 
    height: 64, 
    maxWidth: 68, 
    marginHorizontal: 5, 
    borderRadius: 12, 
    backgroundColor: '#1E293B', 
    borderWidth: 1.5, 
    borderColor: '#334155', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  otpBoxFocused: { 
    borderColor: '#10B981', 
    borderWidth: 1.5, 
    backgroundColor: '#1E293B', 
    shadowColor: '#10B981', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.35, 
    shadowRadius: 6, 
    elevation: 3 
  },
  otpBoxError: { 
    borderColor: '#FF4D6A' 
  },
  otpText: { 
    fontSize: 24, 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    fontFamily: theme.fonts.monospace 
  },
  otpPlaceholderText: { 
    color: 'rgba(255, 255, 255, 0.3)', 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    fontFamily: theme.fonts.monospace 
  },
  hiddenInput: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    opacity: 0, 
    color: '#FFFFFF', 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  
  errorText: { color: '#FF4D6A', fontSize: 12, textAlign: 'center', marginBottom: 15, fontWeight: 'bold', fontFamily: theme.fonts.body },
  resendContainer: { alignItems: 'center' },
  resendTextSub: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1, fontWeight: 'bold', marginBottom: 5, fontFamily: theme.fonts.body },
  resendTextMain: { color: '#FF6B1A', fontSize: 14, fontWeight: 'bold', fontFamily: theme.fonts.body },
  backContainer: { marginTop: 10 },
  backText: { color: theme.colors.textMuted, fontSize: 12, letterSpacing: 1, fontWeight: '600', fontFamily: theme.fonts.monospace },
  successContainer: { alignItems: 'center', paddingVertical: 20 },
  successText: { fontSize: 22, fontWeight: 'bold', color: '#10E87A', marginBottom: 5, fontFamily: theme.fonts.heading },
  successSubtext: { fontSize: 14, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }
});