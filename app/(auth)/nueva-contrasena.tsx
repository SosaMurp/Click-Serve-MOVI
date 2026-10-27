import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar, Banner, Button, Screen, space, Text, TextField } from '@/src/design';
import { PasswordChecklist } from '@/src/features/auth/PasswordChecklist';
import { authApi } from '@/src/api/endpoints';
import { errorMessage } from '@/src/api/client';
import { passwordIssues } from '@/src/lib/validators';
import { dialog } from '@/src/ui/dialog';

export default function NuevaContrasena() {
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();
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
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(String(email), String(token), password);
      await dialog.alert('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña. Cerramos tus sesiones en otros dispositivos.');
      router.replace('/login');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen header={<AppBar title="Nueva contraseña" fallbackHref="/login" />} footer={<Button title="Guardar contraseña" icon="content-save-outline" onPress={submit} loading={loading} full />}>
      <Text variant="headline" style={styles.heading} accessibilityRole="header">Crea tu nueva contraseña</Text>
      <Text variant="body" tone="soft" style={styles.body}>Usa una que no hayas usado antes en otras apps.</Text>
      {error ? <Banner tone="error" title="No se guardó la contraseña" body={error} style={styles.banner} /> : null}
      <TextField label="Nueva contraseña" icon="lock-outline" password value={password} onChangeText={(t) => { setPassword(t); setErrors((x) => ({ ...x, password: undefined })); }} error={errors.password} autoComplete="new-password" />
      <PasswordChecklist value={password} />
      <TextField label="Confírmala" icon="lock-check-outline" password value={confirm} onChangeText={(t) => { setConfirm(t); setErrors((x) => ({ ...x, confirm: undefined })); }} error={errors.confirm} autoComplete="new-password" onSubmitEditing={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: space.lg },
  body: { marginTop: space.sm, marginBottom: space.xl },
  banner: { marginBottom: space.lg },
});
