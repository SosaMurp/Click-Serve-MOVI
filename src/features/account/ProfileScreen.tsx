import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppBar, Avatar, Button, Collapsible, color, IconName, ListItem, Pill, radius, Screen, SectionHeader, space, Surface, Text } from '../../design';
import { BigAction } from '../orders/BigAction';
import { fileUrl } from '../../api/client';
import { useSession } from '../../state/session';
import { dialog } from '../../ui/dialog';

type Item = { icon: IconName; title: string; subtitle?: string; href: string; tone?: 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'; trailingText?: string };

// Perfil compartido por cliente y técnico: tarjeta con avatar, métricas y la lista de ajustes.
// `simple` (cliente, enfoque CILIM): lo de uso diario en filas grandes y el resto en "Más opciones".
export function ProfileScreen({ metrics, sections, simple }: { metrics?: React.ReactNode; sections: { title: string; items: Item[] }[]; simple?: boolean }) {
  const router = useRouter();
  const { user, signOut } = useSession();
  if (!user) return null;

  const logout = async () => {
    const ok = await dialog.confirm({ title: '¿Cerrar sesión?', message: 'Tendrás que volver a entrar con tu correo y contraseña.', confirmText: 'Cerrar sesión' });
    if (ok) await signOut({ message: 'Cerraste sesión.' });
  };

  const common: { title: string; items: Item[] }[] = [
    {
      title: 'Seguridad y privacidad',
      items: [
        { icon: 'lock', title: 'Seguridad', subtitle: 'Contraseña, verificación en dos pasos y sesiones', href: '/seguridad', tone: 'brand', trailingText: user['2FA_Activo'] ? '2 pasos' : undefined },
        { icon: 'bell', title: 'Notificaciones', href: '/notificaciones', tone: 'accent' },
        { icon: 'shield', title: 'Mis datos', subtitle: 'Descargar tu información o eliminar la cuenta', href: '/mis-datos', tone: 'neutral' },
      ],
    },
    {
      title: 'Ayuda',
      items: [
        { icon: 'help-circle', title: 'Centro de ayuda', href: '/ayuda', tone: 'brand' },
        { icon: 'life-buoy', title: 'Soporte', subtitle: 'Tus casos y chat con un asesor', href: '/soporte', tone: 'accent' },
        { icon: 'file-text', title: 'Términos y condiciones', href: '/legal/terminos', tone: 'neutral' },
        { icon: 'eye', title: 'Aviso de privacidad', href: '/legal/privacidad', tone: 'neutral' },
      ],
    },
  ];

  if (simple) {
    const all = [...sections, ...common].flatMap((s) => s.items);
    const daily = new Set(['/seguridad', '/ayuda', ...sections.flatMap((s) => s.items.map((i) => i.href))]);
    return (
      <Screen inTabs header={<AppBar title="Mi cuenta" back={false} />}>
        <View style={styles.simpleHead}>
          <Avatar uri={fileUrl(user.foto_url)} nombre={user.nombre} apellido={user.apellido} size={72} />
          <View style={styles.flex}>
            <Text variant="headline" numberOfLines={2}>{user.nombre} {user.apellido}</Text>
            <Text variant="bodyLg" tone="soft" numberOfLines={1}>{user.correo}</Text>
          </View>
        </View>
        {!user.aprobado ? <Pill label="Tu cuenta está en revisión" tone="warning" icon="clock" style={styles.simplePill} /> : null}
        <BigAction icon="user" title="Mis datos" subtitle="Nombre, teléfono y foto" onPress={() => router.push('/datos-personales')} />
        {all.filter((it) => daily.has(it.href)).map((it) => (
          <BigAction key={it.href} icon={it.icon} title={it.title} subtitle={it.subtitle} onPress={() => router.push(it.href as never)} />
        ))}
        <Collapsible title="Más opciones" style={styles.simpleMore}>
          <Surface padded={false}>
            {all.filter((it) => !daily.has(it.href)).map((it) => (
              <ListItem key={it.href} icon={it.icon} iconTone={it.tone || 'neutral'} title={it.title} subtitle={it.subtitle} onPress={() => router.push(it.href as never)} />
            ))}
          </Surface>
        </Collapsible>
        <Button title="Cerrar sesión" variant="outlined" icon="log-out" full size="xl" onPress={logout} style={styles.logout} />
        <Text variant="caption" tone="muted" align="center" style={styles.version}>Click & Serve · versión {Constants.expoConfig?.version || '1.0.0'}</Text>
      </Screen>
    );
  }

  return (
    <Screen inTabs header={<AppBar title="Perfil" back={false} />}>
      <Surface padded={false} style={styles.card}>
        <View style={styles.band} />
        <View style={styles.cardBody}>
          <View style={styles.avatarWrap}>
            <Avatar uri={fileUrl(user.foto_url)} nombre={user.nombre} apellido={user.apellido} size={88} ring />
          </View>
          <Text variant="headline" align="center">{user.nombre} {user.apellido}</Text>
          <Text variant="body" tone="muted" align="center">{user.correo}</Text>
          <View style={styles.pills}>
            <Pill label={user.rol === 'tecnico' ? 'Técnico' : 'Cliente'} tone="brand" size="sm" icon={user.rol === 'tecnico' ? 'tool' : 'home'} />
            {user.aprobado
              ? <Pill label="Cuenta aprobada" tone="success" size="sm" icon="check" />
              : <Pill label="En revisión" tone="warning" size="sm" icon="clock" />}
            {user.verificado_sep ? <Pill label="Cédula SEP" tone="success" size="sm" icon="award" /> : null}
          </View>
          <Button title="Editar datos personales" variant="tonal" icon="edit-2" onPress={() => router.push('/datos-personales')} style={styles.edit} />
        </View>
      </Surface>

      {metrics}

      {[...sections, ...common].map((sec) => (
        <View key={sec.title}>
          <SectionHeader title={sec.title} />
          <Surface padded={false}>
            {sec.items.map((it) => (
              <ListItem key={it.href} icon={it.icon} iconTone={it.tone || 'neutral'} title={it.title} subtitle={it.subtitle} trailingText={it.trailingText} onPress={() => router.push(it.href as never)} />
            ))}
          </Surface>
        </View>
      ))}

      <Button title="Cerrar sesión" variant="outlined" icon="log-out" full onPress={logout} style={styles.logout} />
      <Text variant="caption" tone="muted" align="center" style={styles.version}>Click & Serve · versión {Constants.expoConfig?.version || '1.0.0'}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  simpleHead: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.lg },
  simplePill: { marginBottom: space.lg },
  simpleMore: { marginTop: space.sm },
  card: { overflow: 'hidden' },
  band: { height: 72, backgroundColor: color.groundAlt },
  cardBody: { alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.lg, gap: 4 },
  avatarWrap: { marginTop: -48, marginBottom: space.sm, borderRadius: radius.full },
  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, marginTop: space.sm },
  edit: { alignSelf: 'center', marginTop: space.md },
  logout: { marginTop: space.xl },
  version: { marginTop: space.md },
});
