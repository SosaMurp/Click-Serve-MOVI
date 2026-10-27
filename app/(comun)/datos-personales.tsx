import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Avatar, Button, color, Icon, Screen, Sheet, space, Surface, Text, TextField } from '@/src/design';
import { ApiError, errorMessage, fileUrl } from '@/src/api/client';
import { cuentaApi } from '@/src/api/endpoints';
import { isPhoneMx, onlyDigits } from '@/src/lib/validators';
import { formatDate } from '@/src/lib/format';
import { hapticSuccess, MediaPermissionError, pickImages } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { toast } from '@/src/ui/toast';

type Field = 'nombre' | 'apellido' | 'telefono' | 'bio';

// RF-22/85/86: foto, nombre, teléfono y presentación. Los cambios se guardan solo al tocar "Guardar".
export default function DatosPersonales() {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [f, setF] = useState({ nombre: user?.nombre || '', apellido: user?.apellido || '', telefono: user?.telefono || '', bio: user?.bio || '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoSheet, setPhotoSheet] = useState(false);
  if (!user) return null;
  // Con la identidad verificada el nombre queda ligado al INE (el servidor rechaza cambiarlo).
  const nameLocked = user.identidad_verificada;

  const dirty = f.nombre !== user.nombre || f.apellido !== user.apellido || f.telefono !== (user.telefono || '') || f.bio !== (user.bio || '');
  const set = (k: Field) => (v: string) => {
    setF((x) => ({ ...x, [k]: k === 'telefono' ? onlyDigits(v).slice(0, 10) : v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function changePhoto(camera: boolean) {
    setPhotoSheet(false);
    try {
      const [img] = await pickImages({ camera, front: true, max: 1 });
      if (!img) return;
      setUploading(true);
      const { usuario } = await cuentaApi.uploadAvatar(img);
      setUser(usuario);
      toast.success('Foto actualizada.');
    } catch (e) {
      toast.error(e instanceof MediaPermissionError ? e.message : errorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const e: Partial<Record<Field, string>> = {};
    // Con identidad verificada el nombre no se muestra como editable ni se envía: no se valida.
    if (!nameLocked && f.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.';
    if (!nameLocked && f.apellido.trim().length < 2) e.apellido = 'Escribe tu apellido.';
    if (f.telefono && !isPhoneMx(f.telefono)) e.telefono = 'Escribe un teléfono de 10 dígitos.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const { usuario } = await cuentaApi.updateProfile({ ...(nameLocked ? {} : { nombre: f.nombre.trim(), apellido: f.apellido.trim() }), telefono: f.telefono || undefined, bio: user!.rol === 'tecnico' ? f.bio.trim() : undefined });
      setUser(usuario);
      hapticSuccess();
      toast.success('Datos guardados.');
      goBack(router);
    } catch (err) {
      if (err instanceof ApiError && err.field) setErrors({ [err.field]: err.message });
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Datos personales" confirmDiscard={dirty} />}
      footer={<Button title="Guardar cambios" icon="check" onPress={save} loading={saving} disabled={!dirty} full size="lg" />}
    >
      <View style={styles.photo}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cambiar foto de perfil" onPress={() => setPhotoSheet(true)} disabled={uploading}>
          <Avatar uri={fileUrl(user.foto_url)} nombre={user.nombre} apellido={user.apellido} size={104} ring />
          <View style={styles.camera}><Icon name={uploading ? 'loader' : 'camera'} size={18} color={color.ink} /></View>
        </Pressable>
        <Button title={uploading ? 'Subiendo…' : 'Cambiar foto'} variant="text" onPress={() => setPhotoSheet(true)} disabled={uploading} />
      </View>

      {nameLocked ? null : (
        <>
          <TextField label="Nombre" value={f.nombre} onChangeText={set('nombre')} error={errors.nombre} maxLength={60} autoComplete="given-name" />
          <TextField label="Apellido" value={f.apellido} onChangeText={set('apellido')} error={errors.apellido} maxLength={60} autoComplete="family-name" />
        </>
      )}
      <TextField label="Teléfono" value={f.telefono} onChangeText={set('telefono')} error={errors.telefono} keyboardType="phone-pad" icon="phone" maxLength={10} autoComplete="tel" helper="Lo ve tu técnico o cliente solo durante un servicio activo." />
      {user.rol === 'tecnico' ? (
        <TextField label="Sobre mí" value={f.bio} onChangeText={set('bio')} multiline maxLength={500} counter placeholder="Experiencia, especialidades y forma de trabajo" />
      ) : null}

      <Surface tint="sunk" style={styles.readonly}>
        {nameLocked ? (
          <>
            <Text variant="caption" tone="muted">Nombre</Text>
            <Text variant="body">{user.nombre} {user.apellido}</Text>
          </>
        ) : null}
        <Text variant="caption" tone="muted" style={nameLocked ? styles.mt : undefined}>Correo</Text>
        <Text variant="body">{user.correo}</Text>
        {user.fecha_nacimiento ? (
          <>
            <Text variant="caption" tone="muted" style={styles.mt}>Fecha de nacimiento</Text>
            <Text variant="body">{formatDate(user.fecha_nacimiento)}</Text>
          </>
        ) : null}
        <Text variant="caption" tone="muted" style={styles.mt}>{nameLocked ? 'Para corregir tu nombre, correo o fecha de nacimiento escribe a soporte: forman parte de tu identidad verificada.' : 'Para cambiar tu correo o fecha de nacimiento escribe a soporte.'}</Text>
      </Surface>

      <Sheet visible={photoSheet} onClose={() => setPhotoSheet(false)} title="Foto de perfil">
        <View style={styles.sheet}>
          <Button title="Tomar foto" icon="camera" variant="tonal" onPress={() => changePhoto(true)} full />
          <Button title="Elegir de la galería" icon="image" variant="tonal" onPress={() => changePhoto(false)} full />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { alignItems: 'center', marginBottom: space.lg },
  camera: { position: 'absolute', right: 2, bottom: 2, width: 36, height: 36, borderRadius: 18, backgroundColor: color.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: color.ground },
  readonly: { marginTop: space.md, gap: 2 },
  mt: { marginTop: space.md },
  sheet: { gap: space.sm, paddingBottom: space.md },
});
