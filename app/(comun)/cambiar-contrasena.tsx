import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Banner, Button, Screen, space, TextField } from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { cuentaApi } from '@/src/api/endpoints';
import { passwordIssues } from '@/src/lib/validators';
import { hapticSuccess } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { PasswordChecklist } from '@/src/features/auth/PasswordChecklist';
import { toast } from '@/src/ui/toast';

// RF-09/15: cambiar la contraseña. El servidor invalida las demás sesiones y devuelve un token nuevo para esta.
export default function CambiarContrasena() {
  const router = useRouter();
  const { replaceToken } = useSession();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirma, setConfirma] = useState('');
  const [errors, setErrors] = useState<{ actual?: string; nueva?: string; confirma?: string }>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    const e: typeof errors = {};
    if (!actual) e.actual = 'Escribe tu contraseña actual.';
    if (passwordIssues(nueva).length) e.nueva = 'La nueva contraseña no cumple los requisitos.';
    else if (nueva === actual) e.nueva = 'Usa una contraseña distinta a la actual.';
    if (confirma !== nueva) e.confirma = 'Las contraseñas no coinciden.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const r = await cuentaApi.changePassword(actual, nueva);
      if (r.token) await replaceToken(r.token);
      hapticSuccess();
      toast.success(r.mensaje || 'Contraseña actualizada.');
      goBack(router);
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'PASSWORD_INCORRECT')) setErrors({ actual: err.message });
      else if (err instanceof ApiError && err.code === 'WEAK_PASSWORD') setErrors({ nueva: err.message });
      else toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Cambiar contraseña" confirmDiscard={!!(actual || nueva)} />}
      footer={<Button title="Guardar contraseña" icon="check" onPress={save} loading={saving} full size="lg" />}
    >
      <Banner tone="info" title="Cerraremos tus otras sesiones" body="Por seguridad, al cambiar la contraseña se cierra la sesión en todos tus demás dispositivos." style={styles.gap} />
      <TextField label="Contraseña actual" value={actual} onChangeText={(v) => { setActual(v); setErrors((x) => ({ ...x, actual: undefined })); }} password autoComplete="current-password" error={errors.actual} />
      <TextField label="Nueva contraseña" value={nueva} onChangeText={(v) => { setNueva(v); setErrors((x) => ({ ...x, nueva: undefined })); }} password autoComplete="new-password" error={errors.nueva} />
      <View style={styles.check}><PasswordChecklist value={nueva} /></View>
      <TextField label="Confirma la nueva contraseña" value={confirma} onChangeText={(v) => { setConfirma(v); setErrors((x) => ({ ...x, confirma: undefined })); }} password autoComplete="new-password" error={errors.confirma} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: space.lg },
  check: { marginBottom: space.md },
});
