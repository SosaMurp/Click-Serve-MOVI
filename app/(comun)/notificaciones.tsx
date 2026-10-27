import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Banner, Divider, Screen, SectionHeader, space, Surface, SwitchRow, Button } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { cuentaApi } from '@/src/api/endpoints';
import type { User } from '@/src/api/types';
import { useSession } from '@/src/state/session';
import { toast } from '@/src/ui/toast';

type Pref = keyof User['preferencias'];

const CANALES: { key: Pref; label: string; description: string }[] = [
  { key: 'notificaciones_push', label: 'Notificaciones en el teléfono', description: 'Avisos de tus servicios, mensajes y pagos.' },
  { key: 'notificaciones_email', label: 'Correo electrónico', description: 'Comprobantes y avisos importantes de tu cuenta.' },
  { key: 'notificaciones_sms', label: 'Mensajes SMS', description: 'Solo para códigos y alertas urgentes.' },
  { key: 'sonido', label: 'Sonido', description: 'Reproducir un sonido al recibir avisos.' },
];

// RF-89: preferencias de avisos. Cada interruptor se guarda al instante.
export default function Notificaciones() {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [prefs, setPrefs] = useState<User['preferencias']>(user?.preferencias || {});
  const value = (k: Pref) => prefs[k] !== false && (k !== 'promociones' || prefs[k] === true);

  async function toggle(k: Pref, v: boolean) {
    const prev = prefs;
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    try {
      const r = await cuentaApi.updatePreferences({ [k]: v });
      setPrefs(r.preferencias);
      if (user) setUser({ ...user, preferencias: r.preferencias });
    } catch (e) {
      setPrefs(prev);
      toast.error(errorMessage(e));
    }
  }

  return (
    <Screen header={<AppBar title="Notificaciones" />}>
      <Banner tone="info" title="Las alertas de seguridad siempre llegan" body="Avisos de SOS, cambios de contraseña y nuevos inicios de sesión no se pueden desactivar." />
      <SectionHeader title="Canales" />
      <Surface>
        {CANALES.map((c, i) => (
          <React.Fragment key={c.key}>
            {i ? <Divider /> : null}
            <SwitchRow label={c.label} description={c.description} value={value(c.key)} onChange={(v) => toggle(c.key, v)} />
          </React.Fragment>
        ))}
      </Surface>
      <SectionHeader title="Novedades" />
      <Surface>
        <SwitchRow label="Promociones y novedades" description="Descuentos y nuevas funciones. Puedes darte de baja cuando quieras." value={value('promociones')} onChange={(v) => toggle('promociones', v)} />
      </Surface>
      {user?.rol === 'tecnico' ? (
        <Button title="Elegir de qué categorías recibo solicitudes" icon="sliders" variant="tonal" onPress={() => router.push('/especialidades')} full style={styles.mt} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mt: { marginTop: space.lg },
});
