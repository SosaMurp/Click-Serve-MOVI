import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { api } from '../components/context/AuthContext';
import { useAuth } from '../components/context/AuthContext';
import { AppButton } from '../components/common/AppButton';
import { theme } from '../components/theme';

type Verification = {
  id_verificacion: string;
  proveedor: string;
  estado: string;
};

type CapturedPhoto = { uri: string; name: string; type: string };

export default function BiometricVerificationScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [captureMode, setCaptureMode] = useState<'reference' | 'live'>('reference');
  const [referencePhoto, setReferencePhoto] = useState<CapturedPhoto | null>(null);
  const cameraRef = React.useRef<CameraView>(null);

  const [scanCountdown, setScanCountdown] = useState(7);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = React.useRef<any>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (cameraVisible && permission?.granted && !isTimerPaused) {
      setScanCountdown(7);
      setIsAutoCapturing(true);

      timerRef.current = setInterval(() => {
        setScanCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            capturePhoto();
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
  }, [cameraVisible, captureMode, permission?.granted, isTimerPaused]);

  const requestVerification = async () => {
    if (!token) {
      setFeedback('Tu sesión no está disponible. Redirigiendo al inicio de sesión...');
      Alert.alert('Sesión requerida', 'Inicia sesión para comenzar la verificación facial.');
      router.replace('/' as any);
      return;
    }

    setIsLoading(true);
    setFeedback('Solicitando desafío biométrico...');
    try {
      const response = await api.post('/api/biometria/solicitar');
      if (response.status !== 201 || !response.data?.verificacion) {
        throw new Error('El backend no devolvió un desafío biométrico válido.');
      }
      setVerification(response.data.verificacion);
      setFeedback('Desafío creado. Captura primero la foto de referencia.');
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'No se pudo iniciar la verificación biométrica.';
      setFeedback(message);
      Alert.alert('Error biométrico', message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    if (!verification) return;
    setIsLoading(true);
    setFeedback('Consultando el resultado...');
    try {
      const response = await api.get(`/api/biometria/${verification.id_verificacion}`);
      setVerification(response.data.verificacion);
      setFeedback(`Estado actual: ${response.data.verificacion.estado}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo consultar el estado.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCamera = async (mode: 'reference' | 'live') => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setFeedback('Debes conceder permiso para usar la cámara.');
        Alert.alert('Permiso requerido', 'Autoriza la cámara para continuar.');
        return;
      }
    }
    setCaptureMode(mode);
    setCameraVisible(true);
    setFeedback(`Cámara activa: captura ${mode === 'reference' ? 'la referencia' : 'la imagen en vivo'}.`);
  };

  const capturePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.9 });
    if (!photo?.uri) {
      setFeedback('No se pudo capturar la imagen.');
      return;
    }
    const captured = { uri: photo.uri, name: `${captureMode}.jpg`, type: 'image/jpeg' };
    if (captureMode === 'reference') {
      setReferencePhoto(captured);
      setCameraVisible(false);
      setFeedback('Referencia capturada. Ahora puedes capturar la imagen en vivo.');
      return;
    }
    if (!verification || !referencePhoto) return;
    const form = new FormData();
    form.append('reference_image', referencePhoto as any);
    form.append('live_image', captured as any);
    setIsLoading(true);
    try {
      await api.post(`/api/biometria/${verification.id_verificacion}/compare`, form);
      await refreshStatus();
      setCameraVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo comparar el rostro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {cameraVisible ? (
          <View style={styles.cameraContainer}>
            {!permission ? (
              <Text style={styles.status}>Cargando cámara...</Text>
            ) : !permission.granted ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.status}>Se requieren permisos de cámara.</Text>
                <AppButton title="CONCEDER PERMISOS" onPress={requestPermission} />
              </View>
            ) : (
              <View style={{ flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
                {isAutoCapturing && (
                  <View style={{ position: 'absolute', top: 15, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                      {scanCountdown > 0 ? `Escaneando rostro... ${scanCountdown}s` : 'Procesando imagen...'}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <Text style={styles.cameraMode}>Captura {captureMode === 'reference' ? 'de referencia' : 'en vivo'}</Text>
            <AppButton title="CAPTURAR FOTO" onPress={capturePhoto} isLoading={isLoading} disabled={!permission?.granted} />
          </View>
        ) : <>
        <Text style={styles.title}>Verificación facial</Text>
        <Text style={styles.description}>
          Este flujo crea el desafío que procesará el adaptador OpenCV. La imagen no se valida en el dispositivo.
        </Text>
        {!verification ? (
          <>
            <AppButton title="INICIAR VERIFICACIÓN" onPress={requestVerification} isLoading={isLoading} />
          </>
        ) : (
          <>
            <AppButton title="CAPTURAR REFERENCIA" onPress={() => openCamera('reference')} isLoading={isLoading} />
            {referencePhoto && <Text style={styles.status}>Referencia capturada</Text>}
            {referencePhoto && <AppButton title="CAPTURAR Y COMPARAR" onPress={() => openCamera('live')} isLoading={isLoading} />}
            <Text style={styles.status}>Estado: {verification.estado}</Text>
            <Text style={styles.status}>Proveedor: {verification.proveedor}</Text>
            <AppButton title="ACTUALIZAR ESTADO" onPress={refreshStatus} isLoading={isLoading} />
          </>
        )}
        {feedback ? <Text accessibilityRole="alert" style={styles.feedback}>{feedback}</Text> : null}
        </>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg },
  title: { color: theme.colors.primary, fontSize: 28, fontWeight: '700', marginBottom: 16 },
  description: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 28 },
  status: { color: theme.colors.primary, fontSize: 16, marginBottom: 12 },
  cameraContainer: { flex: 1, gap: 16 },
  camera: { flex: 1, minHeight: 420, borderRadius: 12, overflow: 'hidden' },
  cameraMode: { color: theme.colors.primary, fontSize: 16, textAlign: 'center' },
  feedback: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 18, textAlign: 'center' },
});
