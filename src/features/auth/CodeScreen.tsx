import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, color, Icon, IconName, OtpField, Screen, space, Text } from '../../design';
import { errorMessage } from '../../api/client';
import { goBack } from '../../lib/nav';

type Props = {
  title: string;
  heading?: string;
  body: string;
  // Si se da, se muestra en negrita debajo del texto (referencia "Verifica tu correo").
  email?: string;
  icon?: IconName;
  onCode: (code: string) => Promise<string | null>;
  onResend?: () => Promise<void>;
  resendLabel?: string;
  footerNote?: React.ReactNode;
  fallbackHref?: string;
  backLabel?: string;
  expiresAt?: number;
};

const LENGTH = 6;

// Pantalla de código (verificación de correo, 2FA, recuperación) con el diseño de la referencia:
// círculo durazno con el ícono, una caja por dígito, VERIFICAR CÓDIGO y reenviar.
// El código también se verifica solo al teclear el último dígito (RNF-18).
// onCode devuelve un mensaje de error para mostrarlo y reiniciar el campo, o null si avanzó.
export function CodeScreen({ title, body, email, icon = 'mail', onCode, onResend, resendLabel = 'Reenviar código', footerNote, fallbackHref = '/login', backLabel = 'Volver', expiresAt }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reset, setReset] = useState(0);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(onResend ? 30 : 0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const submit = async (value: string) => {
    if (busy || value.length !== LENGTH) return;
    setBusy(true);
    setError(null);
    const message = await onCode(value);
    setBusy(false);
    if (message) {
      setError(message);
      setReset((r) => r + 1);
    }
  };

  const resend = async () => {
    if (!onResend) return;
    setBusy(true);
    try {
      await onResend();
      setCooldown(60);
      setError(null);
      setReset((r) => r + 1);
    } catch (e) {
      setError(errorMessage(e, 'No pudimos reenviar el código. Intenta de nuevo.'));
    } finally {
      setBusy(false);
    }
  };

  const remaining = expiresAt ? Math.max(0, Math.round((expiresAt - now) / 1000)) : null;

  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.circle}><Icon name={icon} size={36} color={color.accentStrong} /></View>
        <Text variant="headline" align="center" style={styles.heading} accessibilityRole="header">{title}</Text>
        <Text variant="body" tone="muted" align="center" style={styles.body}>{body}</Text>
        {email ? <Text variant="subtitle" weight="700" align="center" style={styles.email}>{email}</Text> : null}
      </View>

      <View style={styles.otp}>
        <OtpField length={LENGTH} onComplete={submit} onChange={setCode} disabled={busy} error={error} resetKey={reset} />
      </View>
      {remaining !== null ? (
        <Text variant="bodySm" tone={remaining < 30 ? 'danger' : 'muted'} align="center" style={styles.timer} tabular>
          {remaining > 0 ? `El código vence en ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : 'El tiempo se agotó. Vuelve a iniciar sesión.'}
        </Text>
      ) : null}

      <Button title="Verificar código" variant="accent" onPress={() => submit(code)} loading={busy} disabled={code.length !== LENGTH} full size="lg" style={styles.verify} />

      {onResend ? (
        <View style={styles.resend}>
          <Text variant="overline" tone="muted">¿No recibiste nada?</Text>
          <Button title={cooldown > 0 ? `${resendLabel} en ${cooldown} s` : resendLabel} variant="text" onPress={resend} disabled={cooldown > 0 || busy} style={styles.resendBtn} />
        </View>
      ) : null}
      {__DEV__ ? (
        <Banner tone="info" title="Modo desarrollo" body="Sin correo configurado en el servidor, el código aparece en la consola del backend." style={styles.dev} />
      ) : null}
      {footerNote}

      <Pressable accessibilityRole="link" onPress={() => goBack(router, fallbackHref)} style={styles.back} hitSlop={8}>
        <Icon name="arrow-left" size={18} color={color.inkSoft} />
        <Text variant="label" tone="soft">{backLabel}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginTop: space.xxl },
  circle: { width: 88, height: 88, borderRadius: 44, backgroundColor: color.accentSoft, alignItems: 'center', justifyContent: 'center' },
  heading: { marginTop: space.xl },
  body: { marginTop: space.sm, maxWidth: 320 },
  email: { marginTop: space.xs },
  otp: { marginTop: space.xl },
  timer: { marginTop: space.md },
  verify: { marginTop: space.xl },
  resend: { alignItems: 'center', marginTop: space.lg },
  resendBtn: { alignSelf: 'center' },
  dev: { marginTop: space.xl },
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 48, marginTop: space.xl },
});
