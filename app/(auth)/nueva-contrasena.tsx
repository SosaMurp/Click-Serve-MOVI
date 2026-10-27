import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar, Banner, Button, Screen, space, Text, TextField } from '@/src/design';
import { PasswordChecklist } from '@/src/features/auth/PasswordChecklist';
import { authApi } from '@/src/api/endpoints';
import { errorMessage } from '@/src/api/client';
import { passwordIssues } from '@/src/lib/validators';
import { dialog } from '@/src/ui/dialog';
import { clearHandoff, peekHandoff } from '@/src/features/auth/handoff';

export default function NuevaContrasena() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [token] = useState(() => peekHandoff('reset_token'));
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    const missing = passwordIssues(password);
    if (missing.length) e.password = `Le falta: ${missing.join(', ')}.`;
    if (confirm !== password) e.confirm = 'Las contraseñas no coinciden.';
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!token) {
      setError('Tu verificación ya no está disponible. Pide un código nuevo para continuar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(String(email), token, password);
      clearHandoff('reset_token');
      await dialog.alert('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña. Cerramos tus sesiones en otros dispositivos.');
      router.replace('/login');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen header={<AppBar title="Nueva contraseña" fallbackHref="/login" />} footer={<Button title="Guardar contraseña" icon="save" onPress={submit} loading={loading} full />}>
      <Text variant="headline" style={styles.heading} accessibilityRole="header">Crea tu nueva contraseña</Text>
      <Text variant="body" tone="soft" style={styles.body}>Usa una que no hayas usado antes en otras apps.</Text>
      {!token ? (
        <Banner tone="warning" title="Vuelve a verificar tu código" body="Por seguridad, la verificación no se guarda si recargas la página." style={styles.banner} action={<Button title="Pedir código" variant="tonal" onPress={() => router.replace('/recuperar')} />} />
      ) : null}
      {error ? <Banner tone="error" title="No se guardó la contraseña" body={error} style={styles.banner} /> : null}
      <TextField label="Nueva contraseña" icon="lock" password value={password} onChangeText={(t) => { setPassword(t); setErrors((x) => ({ ...x, password: undefined })); }} error={errors.password} autoComplete="new-password" />
      <PasswordChecklist value={password} />
      <TextField label="Confírmala" icon="lock" password value={confirm} onChangeText={(t) => { setConfirm(t); setErrors((x) => ({ ...x, confirm: undefined })); }} error={errors.confirm} autoComplete="new-password" onSubmitEditing={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: space.lg },
  body: { marginTop: space.sm, marginBottom: space.xl },
  banner: { marginBottom: space.lg },
});
