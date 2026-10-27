import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Banner, ListItem, Pill, Screen, SectionHeader, space, Surface } from '@/src/design';
import { useSession } from '@/src/state/session';

// RF-13: centro de seguridad de la cuenta.
export default function Seguridad() {
  const router = useRouter();
  const { user } = useSession();
  if (!user) return null;
  const twoFa = user['2FA_Activo'];
  return (
    <Screen header={<AppBar title="Seguridad" />}>
      {!twoFa ? <Banner tone="warning" title="Protege mejor tu cuenta" body="Activa la verificación en dos pasos para que nadie entre solo con tu contraseña." style={styles.gap} /> : null}
      <SectionHeader title="Acceso" />
      <Surface padded={false}>
        <ListItem icon="key" iconTone="brand" title="Cambiar contraseña" subtitle="Cierra las sesiones en otros dispositivos" onPress={() => router.push('/cambiar-contrasena')} />
        <ListItem
          icon="smartphone"
          iconTone={twoFa ? 'success' : 'warning'}
          title="Verificación en dos pasos"
          subtitle="Código de una app autenticadora al iniciar sesión"
          trailing={<Pill label={twoFa ? 'Activa' : 'Inactiva'} tone={twoFa ? 'success' : 'neutral'} size="sm" />}
          onPress={() => router.push('/verificacion-dos-pasos')}
        />
        <ListItem icon="monitor" iconTone="accent" title="Sesiones activas" subtitle="Revisa y cierra sesiones en otros dispositivos" onPress={() => router.push('/sesiones')} />
      </Surface>
      <SectionHeader title="Identidad" />
      <Surface padded={false}>
        <ListItem
          icon="user-check"
          iconTone={user.identidad_verificada ? 'success' : 'warning'}
          title="Verificación de identidad"
          subtitle={user.identidad_verificada ? 'INE y rostro verificados' : 'Pendiente de revisión'}
          trailing={<Pill label={user.identidad_verificada ? 'Verificada' : 'Pendiente'} tone={user.identidad_verificada ? 'success' : 'warning'} size="sm" />}
          onPress={user.rol === 'tecnico' ? () => router.push('/verificacion') : undefined}
        />
      </Surface>
      <SectionHeader title="Privacidad" />
      <Surface padded={false}>
        <ListItem icon="download" iconTone="brand" title="Mis datos" subtitle="Descarga tu información o elimina tu cuenta" onPress={() => router.push('/mis-datos')} />
        <ListItem icon="eye" iconTone="neutral" title="Aviso de privacidad" onPress={() => router.push('/legal/privacidad')} />
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: space.sm },
});
