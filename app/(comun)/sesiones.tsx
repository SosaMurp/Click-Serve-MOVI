import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppBar, Button, color, Icon, Pill, radius, Screen, SkeletonList, space, Surface, Text } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { cuentaApi } from '@/src/api/endpoints';
import type { Sesion } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { formatDateTime } from '@/src/lib/format';
import { useSession } from '@/src/state/session';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

const deviceIcon = (d: string) => (/android|iphone|ios|móvil|mobile/i.test(d) ? 'smartphone' : /ipad|tablet/i.test(d) ? 'tablet' : 'monitor');

// RF-12/RF-01: sesiones activas; cerrar una, todas las demás o todas (incluida esta).
export default function Sesiones() {
  const { signOut } = useSession();
  const { data, loading, reload } = useLoader(() => cuentaApi.sessions().then((r) => r.sesiones), []);
  const [busy, setBusy] = useState<string | null>(null);
  const list = data || [];
  const others = list.filter((s) => !s.es_sesion_actual);

  async function revoke(s: Sesion) {
    setBusy(s.id_sesion);
    try {
      await cuentaApi.revokeSession(s.id_sesion);
      toast.show('Sesión cerrada.');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function revokeOthers() {
    const ok = await dialog.confirm({ title: '¿Cerrar las demás sesiones?', message: 'Tendrás que volver a entrar en esos dispositivos.', confirmText: 'Cerrar sesiones', destructive: true });
    if (!ok) return;
    setBusy('others');
    try {
      const r = await cuentaApi.revokeOthers();
      toast.success(r.mensaje || 'Sesiones cerradas.');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function logoutEverywhere() {
    const ok = await dialog.confirm({ title: '¿Cerrar sesión en todos lados?', message: 'Se cerrará también en este dispositivo.', confirmText: 'Cerrar todo', destructive: true });
    if (!ok) return;
    setBusy('all');
    try { await cuentaApi.revokeOthers(); } catch { /* se cierra localmente de todos modos */ }
    await signOut({ message: 'Cerraste sesión en todos tus dispositivos.' });
  }

  return (
    <Screen header={<AppBar title="Sesiones activas" />}>
      <Text variant="body" tone="soft" style={styles.intro}>Estos son los dispositivos donde tu cuenta está abierta. Si no reconoces alguno, ciérralo y cambia tu contraseña.</Text>
      {loading ? <SkeletonList rows={2} /> : null}
      {list.map((s) => (
        <Surface key={s.id_sesion} style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.icon, s.es_sesion_actual && { backgroundColor: color.successSoft }]}>
              <Icon name={deviceIcon(s.dispositivo)} size={20} color={s.es_sesion_actual ? color.successInk : color.brandInk} />
            </View>
            <View style={styles.flex}>
              <Text variant="subtitle" numberOfLines={2}>{s.dispositivo || 'Dispositivo desconocido'}</Text>
              <Text variant="caption" tone="muted">Inicio: {formatDateTime(s.fecha_creacion)}</Text>
            </View>
            {s.es_sesion_actual ? <Pill label="Este dispositivo" tone="success" size="sm" /> : (
              <Button title="Cerrar" variant="text" onPress={() => revoke(s)} loading={busy === s.id_sesion} disabled={!!busy} />
            )}
          </View>
        </Surface>
      ))}
      <View style={styles.actions}>
        {others.length ? <Button title="Cerrar las demás sesiones" variant="outlined" icon="log-out" onPress={revokeOthers} loading={busy === 'others'} disabled={!!busy} full /> : null}
        <Button title="Cerrar sesión en todos lados" variant="danger" icon="power" onPress={logoutEverywhere} loading={busy === 'all'} disabled={!!busy} full />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  intro: { marginBottom: space.lg },
  card: { marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: space.sm, marginTop: space.lg },
});
