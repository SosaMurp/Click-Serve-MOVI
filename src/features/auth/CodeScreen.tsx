import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppBar, Banner, Button, OtpField, Screen, space, Text } from '../../design';

type Props = {
  title: string;
  heading: string;
  body: string;
  onCode: (code: string) => Promise<string | null>;
  onResend?: () => Promise<void>;
  resendLabel?: string;
  footerNote?: React.ReactNode;
  fallbackHref?: string;
  expiresAt?: number;
};

// Pantalla de código de 6 dígitos (verificación de correo, 2FA, recuperación).
// onCode devuelve un mensaje de error para mostrarlo y reiniciar el campo, o null si avanzó.
export function CodeScreen({ title, heading, body, onCode, onResend, resendLabel = 'Reenviar código', footerNote, fallbackHref = '/login', expiresAt }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reset, setReset] = useState(0);
  const [cooldown, setCooldown] = useState(onResend ? 30 : 0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const submit = async (code: string) => {
    setBusy(true);
    setError(null);
    const message = await onCode(code);
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
    } finally {
      setBusy(false);
    }
  };

  const remaining = expiresAt ? Math.max(0, Math.round((expiresAt - now) / 1000)) : null;

  return (
    <Screen header={<AppBar title={title} fallbackHref={fallbackHref} />}>
      <Text variant="headline" style={styles.heading} accessibilityRole="header">{heading}</Text>
      <Text variant="body" tone="soft" style={styles.body}>{body}</Text>
      <OtpField onComplete={submit} disabled={busy} error={error} resetKey={reset} />
      {remaining !== null ? (
        <Text variant="bodySm" tone={remaining < 30 ? 'bermellon' : 'muted'} align="center" style={styles.timer} tabular>
          {remaining > 0 ? `El código vence en ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : 'El tiempo se agotó. Vuelve a iniciar sesión.'}
        </Text>
      ) : null}
      {onResend ? (
        <View style={styles.resend}>
          <Button title={cooldown > 0 ? `${resendLabel} en ${cooldown} s` : resendLabel} variant="text" icon="refresh" onPress={resend} disabled={cooldown > 0 || busy} />
        </View>
      ) : null}
      {__DEV__ ? (
        <Banner tone="info" title="Modo desarrollo" body="Sin correo configurado en el servidor, el código aparece en la consola del backend." style={styles.dev} />
      ) : null}
      {footerNote}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: space.lg },
  body: { marginTop: space.sm, marginBottom: space.xl },
  timer: { marginTop: space.md },
  resend: { alignItems: 'center', marginTop: space.lg },
  dev: { marginTop: space.xl },
});
