import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Banner, Button, color, Icon, Pill, Screen, SectionHeader, space, Surface, Text, TextField } from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { cuentaApi, tecnicoApi } from '@/src/api/endpoints';
import { onlyDigits } from '@/src/lib/validators';
import { hapticSuccess } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { toast } from '@/src/ui/toast';

// RF-24/25: presentación profesional y validación de la cédula ante la SEP.
export default function PerfilProfesional() {
  const router = useRouter();
  const { user, setUser, refresh } = useSession();
  const [bio, setBio] = useState(user?.bio || '');
  const [cedula, setCedula] = useState('');
  const [cedulaError, setCedulaError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; titulo: string | null; mensaje: string } | null>(null);

  async function saveBio() {
    setSaving(true);
    try {
      const { usuario } = await cuentaApi.updateProfile({ bio: bio.trim() });
      setUser(usuario);
      hapticSuccess();
      toast.success('Presentación guardada.');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function validate() {
    if (!/^\d{7,8}$/.test(cedula)) { setCedulaError('La cédula profesional tiene 7 u 8 dígitos.'); return; }
    setValidating(true);
    setResultado(null);
    try {
      const r = await tecnicoApi.validarCedula(cedula);
      setResultado({ ok: r.verificado_sep, titulo: r.titulo, mensaje: r.mensaje });
      if (r.verificado_sep) { hapticSuccess(); refresh(); }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'SEP_UNAVAILABLE') setResultado({ ok: false, titulo: null, mensaje: e.message });
      else if (e instanceof ApiError && (e.field === 'cedula' || e.code === 'SEP_NO_MATCH')) setCedulaError(e.message);
      else toast.error(errorMessage(e));
    } finally {
      setValidating(false);
    }
  }

  return (
    <Screen header={<AppBar title="Perfil profesional" confirmDiscard={bio !== (user?.bio || '')} />}>
      <SectionHeader title="Presentación" />
      <Surface>
        <TextField label="Sobre mí" value={bio} onChangeText={setBio} multiline maxLength={500} counter placeholder="Años de experiencia, especialidades, cómo trabajas…" helper="Los clientes la ven al elegir técnico." />
        <Button title="Guardar presentación" icon="check" variant="filled" onPress={saveBio} loading={saving} disabled={bio === (user?.bio || '')} />
      </Surface>

      <SectionHeader title="Cédula profesional" />
      {user?.verificado_sep ? (
        <Surface tint="sky">
          <View style={styles.row}>
            <Icon name="award" size={22} color={color.brandInk} />
            <Text variant="title" style={styles.flex}>Cédula verificada ante la SEP</Text>
            <Pill label="Verificada" tone="success" size="sm" />
          </View>
          <Text variant="bodySm" tone="soft" style={styles.mt}>Tu perfil muestra la insignia "Cédula SEP".</Text>
        </Surface>
      ) : (
        <Surface>
          <Text variant="bodySm" tone="soft">Consultamos el Registro Nacional de Profesionistas con tu nombre. Si coincide, tu perfil muestra la insignia "Cédula SEP".</Text>
          <View style={styles.mt}>
            <TextField label="Número de cédula" value={cedula} onChangeText={(v) => { setCedula(onlyDigits(v).slice(0, 8)); setCedulaError(null); }} keyboardType="number-pad" icon="award" error={cedulaError} maxLength={8} />
          </View>
          <Button title="Validar con la SEP" icon="search" onPress={validate} loading={validating} disabled={cedula.length < 7} full />
          {resultado ? (
            <Banner tone={resultado.ok ? 'success' : 'warning'} title={resultado.ok ? `Verificada${resultado.titulo ? `: ${resultado.titulo}` : ''}` : 'No se pudo verificar ahora'} body={resultado.mensaje} style={styles.mt} />
          ) : null}
        </Surface>
      )}

      <SectionHeader title="Más credenciales" />
      <Button title="Subir certificaciones y documentos" icon="upload" variant="tonal" onPress={() => router.push('/verificacion')} full />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  mt: { marginTop: space.md },
});
