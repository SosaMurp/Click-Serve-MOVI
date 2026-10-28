import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, Screen, space, Text, TextField } from '@/src/design';
import { AuthHeader } from '@/src/features/auth/AuthHeader';
import { SocialButtons } from '@/src/features/auth/SocialButtons';
import { authApi, SocialResult } from '@/src/api/endpoints';
import { ApiError, errorMessage } from '@/src/api/client';
import { useSession } from '@/src/state/session';
import { isEmail } from '@/src/lib/validators';
import { handOff } from '@/src/features/auth/handoff';

// Login (referencia "Click & Serve · Acceso a servicios técnicos"). RF-01/03/04.
export default function Login() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Mismo cierre para contraseña, Google y Apple: 2FA, sesión o registro prellenado.
  const finish = async (res: SocialResult, correo: string) => {
    if (res.requires2FA && res.reto) {
      handOff('reto_2fa', res.reto);
      router.push({ pathname: '/dos-pasos', params: { metodo: res.metodo || 'TOTP', correo } });
      return;
    }
    if (res.token && res.usuario) {
      await signIn(res.token, res.usuario);
      router.replace('/');
      return;
    }
    if (res.requiere_registro) {
      router.push({ pathname: '/registro', params: { email: res.email || '', nombre: res.nombre || '', apellidos: res.apellidos || '' } });
    }
  };

  const run = async (call: () => Promise<SocialResult>, correo = '') => {
    setLoading(true);
    setError(null);
    try {
      await finish(await call(), correo);
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'RATE_LIMITED' ? e.message : errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    const errs: typeof fieldErrors = {};
    if (!isEmail(email)) errs.email = 'Escribe tu correo, por ejemplo ana@correo.mx.';
    if (!password) errs.password = 'Escribe tu contraseña.';
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    run(() => authApi.login(email.trim(), password), email.trim());
  };

  return (
    <Screen header={<AuthHeader back subtitle="Expertos técnicos a un clic de distancia en Lázaro Cárdenas" />}>
      {error ? <Banner tone="error" title="No pudimos iniciar tu sesión" body={error} style={styles.banner} /> : null}
      <TextField
        label="Correo electrónico"
        icon="mail"
        placeholder="nombre@correo.com"
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
        icon="lock"
        placeholder="Ingresa tu contraseña"
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
        <Text variant="label" weight="700" tone="accent">¿Olvidaste tu contraseña?</Text>
      </Pressable>
      <Button title="Iniciar sesión" onPress={submit} loading={loading} full size="lg" />

      <SocialButtons
        disabled={loading}
        onGoogle={(t) => run(() => authApi.google(t))}
        onApple={(r) => run(() => authApi.apple(r.identityToken, r.nombre, r.apellidos))}
        onError={setError}
      />

      <View style={styles.register}>
        <Text variant="body" tone="soft">¿No tienes cuenta?</Text>
        <Button title="Regístrate aquí" variant="text" onPress={() => router.push('/registro')} />
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
  register: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: space.lg, flexWrap: 'wrap' },
  legal: { flexDirection: 'row', justifyContent: 'center', marginTop: space.sm, flexWrap: 'wrap' },
});
