import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, color, Icon, IconName, Screen, space, Text, TextField } from '@/src/design';
import { AuthHeader } from '@/src/features/auth/AuthHeader';
import { authApi } from '@/src/api/endpoints';
import { ApiError, errorMessage } from '@/src/api/client';
import { useSession } from '@/src/state/session';
import { isEmail } from '@/src/lib/validators';

const PROMISES: { icon: IconName; text: string }[] = [
  { icon: 'card-account-details-outline', text: 'Técnicos con INE, rostro y cédula verificados' },
  { icon: 'file-document-check-outline', text: 'Apruebas la cotización antes de que empiecen' },
  { icon: 'shield-check-outline', text: 'Pagas al confirmar y tienes 90 días de garantía' },
];

export default function Login() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async () => {
    const errs: typeof fieldErrors = {};
    if (!isEmail(email)) errs.email = 'Escribe tu correo, por ejemplo ana@correo.mx.';
    if (!password) errs.password = 'Escribe tu contraseña.';
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email.trim(), password);
      if (res.requires2FA && res.reto) {
        router.push({ pathname: '/dos-pasos', params: { reto: res.reto, metodo: res.metodo || 'TOTP', correo: email.trim() } });
        return;
      }
      if (res.token && res.usuario) {
        await signIn(res.token, res.usuario);
        router.replace('/');
      }
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'RATE_LIMITED' ? e.message : errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen header={<AuthHeader title="Iniciar sesión" subtitle="Servicios técnicos verificados en Lázaro Cárdenas" />}>
      {error ? <Banner tone="error" title="No pudimos iniciar tu sesión" body={error} style={styles.banner} /> : null}
      <TextField
        label="Correo electrónico"
        icon="email-outline"
        placeholder="tu@correo.mx"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={(t) => { setEmail(t); setFieldErrors((f) => ({ ...f, email: undefined })); }}
        error={fieldErrors.email}
        returnKeyType="next"
      />
      <TextField
        label="Contraseña"
        icon="lock-outline"
        placeholder="Tu contraseña"
        password
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={(t) => { setPassword(t); setFieldErrors((f) => ({ ...f, password: undefined })); }}
        error={fieldErrors.password}
        onSubmitEditing={submit}
        returnKeyType="go"
      />
      <Pressable accessibilityRole="link" onPress={() => router.push('/recuperar')} style={styles.forgot} hitSlop={8}>
        <Text variant="label" tone="cobalt">¿Olvidaste tu contraseña?</Text>
      </Pressable>
      <Button title="Entrar" onPress={submit} loading={loading} full size="lg" />

      <View style={styles.register}>
        <Text variant="body" tone="soft">¿No tienes cuenta?</Text>
        <Button title="Crea una aquí" variant="text" onPress={() => router.push('/registro')} />
      </View>

      <View style={styles.promises}>
        {PROMISES.map((p) => (
          <View key={p.text} style={styles.promise}>
            <Icon name={p.icon} size={22} color={color.cobaltInk} />
            <Text variant="bodySm" tone="soft" style={styles.flex}>{p.text}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legal}>
        <Button title="Aviso de privacidad" variant="text" onPress={() => router.push('/legal/privacidad')} />
        <Button title="Términos" variant="text" onPress={() => router.push('/legal/terminos')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { marginBottom: space.lg },
  forgot: { alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center', marginTop: -space.xs, marginBottom: space.md },
  register: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: space.md, flexWrap: 'wrap' },
  promises: { marginTop: space.xl, gap: space.md, padding: space.lg, borderRadius: 12, backgroundColor: color.surfaceSunk },
  promise: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  legal: { flexDirection: 'row', justifyContent: 'center', marginTop: space.lg, flexWrap: 'wrap' },
});
