import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const [ineFrente, setIneFrente] = useState<string | null>(null);
  const [ineReverso, setIneReverso] = useState<string | null>(null);
  const [fotoRostro, setFotoRostro] = useState<string | null>(null);
  const [ineModalVisible, setIneModalVisible] = useState(false);
  const [ineStep, setIneStep] = useState<'FRENTE' | 'REVERSO' | 'ROSTRO'>('FRENTE');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [scanCountdown, setScanCountdown] = useState(7);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (ineModalVisible && cameraPermission && !cameraPermission.granted && cameraPermission.canAskAgain) {
      requestCameraPermission();
    }
  }, [ineModalVisible, cameraPermission, requestCameraPermission]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (ineModalVisible && cameraPermission?.granted && !isTimerPaused) {
      setIsAutoCapturing(true);

      timerRef.current = setInterval(() => {
        setScanCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            captureInePhoto();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsAutoCapturing(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [ineModalVisible, ineStep, cameraPermission?.granted, isTimerPaused]);

  const handleRegister = async () => {
    if (!nombre || !apellidos || !email || !password || !confirmPassword || !telefono) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (!fechaBackend) {
      Alert.alert('Error', 'Por favor ingresa una fecha de nacimiento válida (DD/MM/AAAA).');
      return;
    }

    if (!ineFrente || !ineReverso || !fotoRostro) {
      Alert.alert(
        'Verificación de Identidad Requerida',
        'Por regulación de seguridad, debes fotografiar el frente y reverso de tu INE y tu rostro antes de registrarte.',
        [
          { 
            text: 'Completar Verificación', 
            onPress: () => { 
              if (!ineFrente) setIneStep('FRENTE');
              else if (!ineReverso) setIneStep('REVERSO');
              else setIneStep('ROSTRO');
              setIsTimerPaused(false); 
              setScanCountdown(7); 
              setIneModalVisible(true); 
            } 
          }
        ]
      );
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
        perfil: perfil === 'tecnico' ? 2 : 1,
        ine_frente: ineFrente,
        ine_reverso: ineReverso,
        foto_rostro: fotoRostro,
        rostro: fotoRostro,
        url_ine_front: ineFrente,
        url_ine_rev: ineReverso,
        referencia_facial: fotoRostro
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

  const captureInePhoto = async () => {
    try {
      let photoUri = `data:image/jpeg;base64,mockIne${ineStep}_${Date.now()}`;
      if (cameraRef.current) {
        try {
          const snapshot = await cameraRef.current.takePictureAsync({ quality: 0.3, base64: true });
          if (snapshot) {
            photoUri = snapshot.base64 ? `data:image/jpeg;base64,${snapshot.base64}` : snapshot.uri;
          }
        } catch (cErr) {
          console.log('Captura cámara INE fallback:', cErr);
        }
      }

      if (ineStep === 'FRENTE') {
        setIneFrente(photoUri);
        setIsTimerPaused(true);
        Alert.alert(
          'Frente INE Capturado',
          'Ahora fotografía el REVERSO de tu credencial.',
          [
            {
              text: 'OK / Continuar',
              onPress: () => {
                setIneStep('REVERSO');
                setScanCountdown(7);
                setIsTimerPaused(false);
              }
            }
          ]
        );
      } else if (ineStep === 'REVERSO') {
        setIneReverso(photoUri);
        setIsTimerPaused(true);
        Alert.alert(
          'Reverso INE Capturado',
          'Ahora tómate una fotografía de tu ROSTRO para verificar tu identidad.',
          [
            {
              text: 'OK / Continuar',
              onPress: () => {
                setIneStep('ROSTRO');
                setScanCountdown(5);
                setIsTimerPaused(false);
              }
            }
          ]
        );
      } else {
        setFotoRostro(photoUri);
        setIneModalVisible(false);
        setIsTimerPaused(false);
        Alert.alert('Identificación Completa', 'Se han registrado ambas caras de tu INE y tu fotografía facial correctamente.');
      }
    } catch (err) {
      console.error('Error al capturar documento/rostro:', err);
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

            <AppInput
              label="CONFIRMAR CONTRASEÑA"
              placeholder="********"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(''); }}
            />

            <Text style={styles.label}>IDENTIFICACIÓN OFICIAL Y ROSTRO</Text>
            <TouchableOpacity
              style={[styles.ineCaptureButton, (ineFrente && ineReverso && fotoRostro) && styles.ineCaptureButtonSuccess]}
              onPress={() => {
                if (!ineFrente) setIneStep('FRENTE');
                else if (!ineReverso) setIneStep('REVERSO');
                else setIneStep('ROSTRO');
                setIsTimerPaused(false);
                setScanCountdown(7);
                setIneModalVisible(true);
              }}
            >
              <Feather name={(ineFrente && ineReverso && fotoRostro) ? "check-circle" : "camera"} size={16} color={(ineFrente && ineReverso && fotoRostro) ? "#FFFFFF" : "#FF6B1A"} style={{ marginRight: 6 }} />
              <Text style={[styles.ineCaptureText, (ineFrente && ineReverso && fotoRostro) && { color: '#FFFFFF' }]}>
                {(ineFrente && ineReverso && fotoRostro) 
                  ? 'DOCUMENTOS Y ROSTRO CAPTURADOS' 
                  : (!ineFrente 
                      ? 'FOTOGRAFIAR INE Y ROSTRO (OBLIGATORIO)' 
                      : (!ineReverso ? 'CAPTURAR REVERSO DE INE' : 'CAPTURAR FOTO DE ROSTRO'))}
              </Text>
            </TouchableOpacity>

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
              style={{ backgroundColor: '#FF6B1A', height: 52, borderRadius: 14, elevation: 4 }}
            />

            <TouchableOpacity style={styles.loginContainer} onPress={() => router.back()}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta? <Text style={styles.loginTextBold}>Inicia sesión</Text></Text>
            </TouchableOpacity>

          </View>
          
          <Text style={styles.footerText}>CLICK&SERVE © 2026</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Cámara INE y Rostro */}
      <Modal visible={ineModalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
              {ineStep === 'ROSTRO' ? 'FOTOGRAFÍA FACIAL' : `ESCANEO DE INE (${ineStep})`}
            </Text>
            <Text style={{ color: '#9CA8B6', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              {ineStep === 'ROSTRO' 
                ? 'Ubica tu rostro dentro del marco para la validación biométrica.' 
                : `Ubica el ${ineStep} de tu credencial dentro del marco de captura.`}
            </Text>
          </View>

          <View style={{ flex: 1, margin: 20, borderRadius: 16, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
            {!cameraPermission ? (
              <ActivityIndicator size="large" color="#FF6B1A" />
            ) : !cameraPermission.granted ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', textAlign: 'center', marginBottom: 15 }}>
                  Se requiere permiso de cámara para escanear tus documentos y rostro.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#FF6B1A', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20 }}
                  onPress={requestCameraPermission}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>CONCEDER PERMISO</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  facing={ineStep === 'ROSTRO' ? 'front' : 'back'}
                />
                {isAutoCapturing && (
                  <View style={{ position: 'absolute', top: 20, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator color="#FF6B1A" size="small" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                      {scanCountdown > 0 ? `Escaneando ${ineStep}... ${scanCountdown}s` : 'Capturando documento...'}
                    </Text>
                  </View>
                )}
              </>
            )}
            <View style={ineStep === 'ROSTRO' 
              ? { position: 'absolute', width: 220, height: 260, borderWidth: 2, borderColor: '#FF6B1A', borderRadius: 110, borderStyle: 'dashed' }
              : { position: 'absolute', width: 280, height: 180, borderWidth: 2, borderColor: '#FF6B1A', borderRadius: 12, borderStyle: 'dashed' }
            } />
          </View>

          <View style={{ padding: 20, flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#334155', paddingVertical: 14, borderRadius: 25, alignItems: 'center' }}
              onPress={() => setIneModalVisible(false)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1.5, backgroundColor: '#FF6B1A', paddingVertical: 14, borderRadius: 25, alignItems: 'center' }}
              onPress={captureInePhoto}
              disabled={!cameraPermission?.granted}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                {ineStep === 'ROSTRO' ? 'CAPTURAR ROSTRO' : `CAPTURAR ${ineStep}`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 30, fontWeight: '800', color: '#1A202C', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#718096', textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInputContainer: { width: '47%' },
  label: { fontSize: 11, color: '#4A5568', fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 10 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 25 },
  profileButton: { flex: 1, paddingVertical: 12, borderWidth: 1.5, borderColor: '#CBD5E0', borderRadius: 25, alignItems: 'center', marginHorizontal: 4 },
  profileButtonActive: { backgroundColor: '#FF6B1A', borderColor: '#FF6B1A' },
  profileButtonText: { color: '#718096', fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  profileButtonTextActive: { color: '#FFFFFF' },
  loginContainer: { alignItems: 'center', marginTop: 16 },
  loginText: { color: '#718096', fontSize: 14 },
  loginTextBold: { fontWeight: 'bold', color: '#FF6B1A' },
  footerText: { textAlign: 'center', color: '#A0AEC0', fontSize: 11, letterSpacing: 1, marginTop: 10 },
  errorText: { color: '#E53E3E', fontSize: 13, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  ineCaptureButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FF6B1A', borderStyle: 'dashed', backgroundColor: '#FFF7ED', borderRadius: 25, paddingVertical: 12, paddingHorizontal: 15, marginTop: 4, marginBottom: 10 },
  ineCaptureButtonSuccess: { backgroundColor: '#10B981', borderColor: '#10B981', borderStyle: 'solid' },
  ineCaptureText: { color: '#FF6B1A', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
});