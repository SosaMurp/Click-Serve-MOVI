import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Banner, Button, Screen, Segmented, space, Text, TextField } from '@/src/design';
import { authApi } from '@/src/api/endpoints';
import { errorMessage } from '@/src/api/client';
import { isEmail } from '@/src/lib/validators';

type Canal = 'EMAIL' | 'SMS';

// RF-04 y RF-10: recuperar la contraseña eligiendo si el código llega por correo o por SMS.
export default function Recuperar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [canal, setCanal] = useState<Canal>('EMAIL');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isEmail(email)) {
      setFieldError('Escribe el correo con el que te registraste.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.requestRecovery(email.trim(), canal);
      router.push({ pathname: '/recuperar-codigo', params: { email: email.trim().toLowerCase(), canal } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen header={<AppBar title="Recuperar contraseña" fallbackHref="/login" />} footer={<Button title="Enviar código" icon="send" onPress={submit} loading={loading} full />}>
      <Text variant="headline" style={styles.heading} accessibilityRole="header">¿Olvidaste tu contraseña?</Text>
      <Text variant="body" tone="soft" style={styles.body}>Te enviaremos un código para crear una nueva. Tus demás sesiones se cerrarán por seguridad.</Text>
      {error ? <Banner tone="error" title="No pudimos enviar el código" body={error} style={styles.banner} /> : null}
      <TextField
        label="Correo de tu cuenta"
        icon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="tu@correo.mx"
        value={email}
        onChangeText={(t) => { setEmail(t); setFieldError(null); }}
        error={fieldError}
        onSubmitEditing={submit}
      />
      <Text variant="label" tone="soft" style={styles.label}>¿Dónde quieres recibir el código?</Text>
      <Segmented<Canal>
        value={canal}
        onChange={setCanal}
        options={[{ value: 'EMAIL', label: 'Correo', icon: 'mail' }, { value: 'SMS', label: 'SMS', icon: 'message-square' }]}
      />
      <Text variant="bodySm" tone="muted" style={styles.hint}>
        {canal === 'SMS' ? 'Lo enviaremos al celular que registraste en tu cuenta.' : 'Revisa también la carpeta de correo no deseado.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: space.lg },
  body: { marginTop: space.sm, marginBottom: space.xl },
  banner: { marginBottom: space.lg },
  label: { marginBottom: space.sm },
  hint: { marginTop: space.sm },
});
