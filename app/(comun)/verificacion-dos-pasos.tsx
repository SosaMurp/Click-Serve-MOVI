import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { AppBar, Banner, Button, color, OtpField, radius, Screen, space, Steps, Surface, Text, TextField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { cuentaApi } from '@/src/api/endpoints';
import { hapticSuccess } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { toast } from '@/src/ui/toast';

// RF-13: activar o desactivar la verificación en dos pasos con una app autenticadora (TOTP).
export default function DosPasos() {
  const { user, setUser } = useSession();
  const [setup, setSetup] = useState<{ secreto: string; otpauth: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [password, setPassword] = useState('');
  const active = !!user?.['2FA_Activo'];

  async function start() {
    setBusy(true);
    try {
      setSetup(await cuentaApi.start2fa());
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirm(codigo: string) {
    setBusy(true);
    setError(null);
    try {
      const { usuario } = await cuentaApi.confirm2fa(codigo);
      setUser(usuario);
      setSetup(null);
      hapticSuccess();
      toast.success('Verificación en dos pasos activada.');
    } catch (e) {
      setError(errorMessage(e));
      setResetKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!password) { setError('Escribe tu contraseña para desactivarla.'); return; }
    setBusy(true);
    setError(null);
    try {
      const { usuario } = await cuentaApi.disable2fa({ password });
      setUser(usuario);
      setPassword('');
      toast.show('Verificación en dos pasos desactivada.');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const copy = async () => {
    if (!setup) return;
    await Clipboard.setStringAsync(setup.secreto);
    toast.success('Clave copiada.');
  };

  return (
    <Screen header={<AppBar title="Verificación en dos pasos" />}>
      {active ? (
        <>
          <Banner tone="success" title="Está activa" body="Al iniciar sesión te pediremos el código de tu app autenticadora." />
          <Surface style={styles.gap}>
            <Text variant="title">Desactivar</Text>
            <Text variant="bodySm" tone="soft" style={styles.p}>Tu cuenta quedará protegida solo con la contraseña.</Text>
            <TextField label="Contraseña" value={password} onChangeText={(v) => { setPassword(v); setError(null); }} password autoComplete="current-password" error={error} />
            <Button title="Desactivar verificación" variant="danger" onPress={disable} loading={busy} full />
          </Surface>
        </>
      ) : !setup ? (
        <>
          <Surface tint="sky">
            <Text variant="title">Un código además de tu contraseña</Text>
            <Text variant="bodySm" tone="soft" style={styles.p}>Necesitas una app autenticadora como Google Authenticator, Microsoft Authenticator o 1Password.</Text>
          </Surface>
          <Surface style={styles.gap}>
            <Steps current={0} steps={[
              { key: 'a', label: 'Instala una app autenticadora' },
              { key: 'b', label: 'Escanea el código QR o copia la clave' },
              { key: 'c', label: 'Escribe el código de 6 dígitos' },
            ]} />
          </Surface>
          <Button title="Comenzar" icon="arrow-right" onPress={start} loading={busy} full size="lg" style={styles.gap} />
        </>
      ) : (
        <>
          <Surface style={styles.center}>
            <Text variant="title" align="center">Escanea con tu app</Text>
            <View style={styles.qr} accessibilityLabel="Código QR para la app autenticadora">
              <QRCode value={setup.otpauth} size={188} color={color.ink} backgroundColor={color.surface} />
            </View>
            <Text variant="caption" tone="muted" align="center">¿No puedes escanear? Copia esta clave en la app:</Text>
            <Text variant="label" selectable tabular align="center" style={styles.secret}>{setup.secreto.replace(/(.{4})/g, '$1 ').trim()}</Text>
            <View style={styles.row}>
              <Button title="Copiar clave" variant="tonal" icon="copy" onPress={copy} />
              {Platform.OS !== 'web' ? <Button title="Abrir app" variant="outlined" icon="external-link" onPress={() => Linking.openURL(setup.otpauth).catch(() => toast.warning('No encontramos una app autenticadora.'))} /> : null}
            </View>
          </Surface>
          <Surface style={styles.gap}>
            <Text variant="title">Escribe el código</Text>
            <Text variant="bodySm" tone="soft" style={styles.p}>Son 6 dígitos y cambian cada 30 segundos.</Text>
            <OtpField onComplete={confirm} disabled={busy} error={error} resetKey={resetKey} />
          </Surface>
          <Button title="Cancelar" variant="text" onPress={() => setSetup(null)} style={styles.cancel} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: space.lg },
  p: { marginTop: 4, marginBottom: space.md },
  center: { alignItems: 'center', gap: space.md },
  qr: { padding: space.md, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  secret: { letterSpacing: 1.5 },
  row: { flexDirection: 'row', gap: space.sm },
  cancel: { alignSelf: 'center', marginTop: space.md },
});
