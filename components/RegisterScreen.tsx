import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { api } from './context/AuthContext';
import { theme } from './theme';
import { AppInput } from './common/AppInput';
import { AppButton } from './common/AppButton';

let DateTimePicker: any = null;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  DateTimePicker = null;
}

export default function RegisterScreen() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('cliente'); 

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fechaVisual, setFechaVisual] = useState('');
  const [fechaBackend, setFechaBackend] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDateTextChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');

    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.substring(0, 5) + '/' + cleaned.substring(4, 8);
    }

    setFechaVisual(formatted);
    setErrorMessage('');

    if (formatted.length === 10) {
      const [day, month, year] = formatted.split('/');
      setFechaBackend(`${year}-${month}-${day}`);
      
      const parsedYear = parseInt(year);
      const parsedMonth = parseInt(month) - 1; 
      const parsedDay = parseInt(day);
      if (parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
        setDate(new Date(parsedYear, parsedMonth, parsedDay));
      }
    } else {
      setFechaBackend('');
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    
    if (selectedDate) {
      setDate(selectedDate);
      
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();

      setFechaVisual(`${day}/${month}/${year}`); 
      setFechaBackend(`${year}-${month}-${day}`); 
      setErrorMessage('');
    }
  };

  const handleRegister = async () => {
    if (!nombre || !apellidos || !email || !password || !telefono) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!fechaBackend) {
      Alert.alert('Error', 'Por favor ingresa una fecha de nacimiento válida (DD/MM/AAAA).');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/register', {
        nombre: nombre,
        apellidos: apellidos, 
        telefono: telefono,
        email: email,
        fechaNacimiento: fechaBackend, 
        password: password,
        perfil: perfil === 'tecnico' ? 2 : 1 
      });

      setIsLoading(false);
      router.push({
        pathname: '/verify-screen',
        params: { userEmail: email }
      } as any);

    } catch (error: any) {
      setIsLoading(false);
      console.error(error);
      
      const errMessage = error.response?.data?.error || 'No se pudo conectar con el servidor de Click & Serve.';

      if (error.response?.data?.error === 'Usuario Existente') {
        Alert.alert(
          'Usuario Existente',
          'Este correo electrónico ya se encuentra registrado en el sistema.',
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/' as any) 
            }
          ]
        );
      } else {
        Alert.alert('Error en el registro', errMessage);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a la red de servicios en Lázaro Cárdenas</Text>
          </View>

          <View style={styles.card}>
            
            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <AppInput
                  label="NOMBRE"
                  placeholder="Ej. Juan"
                  value={nombre}
                  onChangeText={(text) => { setNombre(text); setErrorMessage(''); }}
                />
              </View>
              <View style={styles.halfInputContainer}>
                <AppInput
                  label="APELLIDOS"
                  placeholder="Ej. Pérez"
                  value={apellidos}
                  onChangeText={(text) => { setApellidos(text); setErrorMessage(''); }}
                />
              </View>
            </View>

            <AppInput
              label="TELÉFONO"
              placeholder="10 dígitos"
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={(text) => { setTelefono(text); setErrorMessage(''); }}
            />

            <AppInput
              label="EMAIL"
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
            />

            <AppInput
              label="FECHA DE NACIMIENTO"
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
              value={fechaVisual}
              onChangeText={handleDateTextChange}
            />

            {showDatePicker && DateTimePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()} 
              />
            )}

            <AppInput
              label="CONTRASEÑA"
              placeholder="********"
              secureTextEntry
              value={password}
              onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
            />

            <Text style={styles.label}>TIPO DE PERFIL</Text>
            <View style={styles.profileRow}>
              <TouchableOpacity 
                style={[styles.profileButton, perfil === 'cliente' && styles.profileButtonActive]}
                onPress={() => setPerfil('cliente')}
              >
                <Text style={[styles.profileButtonText, perfil === 'cliente' && styles.profileButtonTextActive]}>CLIENTE</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.profileButton, perfil === 'tecnico' && styles.profileButtonActive]}
                onPress={() => setPerfil('tecnico')}
              >
                <Text style={[styles.profileButtonText, perfil === 'tecnico' && styles.profileButtonTextActive]}>TÉCNICO</Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <AppButton
              title="REGISTRARME"
              onPress={handleRegister}
              isLoading={isLoading}
            />

            <TouchableOpacity style={styles.loginContainer} onPress={() => router.back()}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta? <Text style={styles.loginTextBold}>Inicia sesión</Text></Text>
            </TouchableOpacity>

          </View>
          
          <Text style={styles.footerText}>CLICK&SERVE © 2026</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 34, fontWeight: '700', color: theme.colors.primary, fontFamily: theme.fonts.heading, marginBottom: 8 },
  subtitle: { fontSize: 14, fontStyle: 'italic', color: theme.colors.textSecondary, fontFamily: theme.fonts.body },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInputContainer: { width: '47%' },
  label: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '700', fontFamily: theme.fonts.body, letterSpacing: 1, marginBottom: 8, marginTop: 10 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 25 },
  profileButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', marginHorizontal: 5 },
  profileButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  profileButtonText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 12, letterSpacing: 1, fontFamily: theme.fonts.body },
  profileButtonTextActive: { color: '#FFFFFF' },
  loginContainer: { alignItems: 'center', marginTop: 16 },
  loginText: { color: theme.colors.textSecondary, fontSize: 14, fontFamily: theme.fonts.body },
  loginTextBold: { fontWeight: 'bold', color: theme.colors.primary },
  footerText: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 10, letterSpacing: 1, marginTop: 10, fontFamily: theme.fonts.monospace },
  errorText: { color: theme.colors.error, fontSize: 13, textAlign: 'center', marginBottom: 15, fontWeight: 'bold', fontFamily: theme.fonts.body }
});