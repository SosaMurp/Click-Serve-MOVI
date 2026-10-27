import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { AppBar, Banner, Chip, color, IconButton, IconName, Pill, Screen, SectionHeader, SkeletonList, space, Surface, Text, Icon, radius, Divider } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { tecnicoApi } from '@/src/api/endpoints';
import type { Especialidad } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { useCategorias } from '@/src/features/orders/hooks';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-23/24: categorías en las que el técnico recibe solicitudes; se pueden pausar sin perder la verificación.
export default function Especialidades() {
  const categorias = useCategorias();
  const { data, loading, setData, reload } = useLoader(() => tecnicoApi.especialidades().then((r) => r.especialidades), []);
  const [busy, setBusy] = useState<string | null>(null);
  const mias = data || [];
  const verificada = (e: Especialidad) => ['VERIFICADA', 'APROBADA'].includes(e.estado);
  const disponibles = categorias.filter((c) => !mias.some((m) => m.categoria === c.codigo));

  async function add(codigo: string) {
    setBusy(codigo);
    try {
      const { especialidad } = await tecnicoApi.agregarEspecialidad(codigo);
      setData((prev) => [...(prev || []), especialidad]);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function toggle(e: Especialidad, activa: boolean) {
    setData((prev) => (prev || []).map((x) => (x.id_especialidad === e.id_especialidad ? { ...x, activa } : x)));
    try {
      await tecnicoApi.alternarEspecialidad(e.id_especialidad, activa);
    } catch (err) {
      toast.error(errorMessage(err));
      reload();
    }
  }

  async function remove(e: Especialidad) {
    const ok = await dialog.confirm({ title: `¿Quitar ${e.nombre}?`, message: verificada(e) ? 'Perderás la verificación de esta especialidad.' : undefined, confirmText: 'Quitar', destructive: true });
    if (!ok) return;
    try {
      await tecnicoApi.quitarEspecialidad(e.id_especialidad);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <Screen header={<AppBar title="Especialidades" />}>
      {!mias.length && !loading ? (
        <Banner tone="info" title="Recibes solicitudes de todas las categorías" body="Sin especialidades registradas te llegan solicitudes generales. Agrega las tuyas para aparecer primero en esas categorías." />
      ) : null}
      <SectionHeader title="Tus especialidades" />
      {loading ? <SkeletonList rows={2} /> : null}
      {mias.length ? (
        <Surface padded={false}>
          {mias.map((e, i) => {
            const cat = categorias.find((c) => c.codigo === e.categoria);
            return (
              <View key={e.id_especialidad}>
                {i ? <Divider /> : null}
                <View style={styles.row}>
                  <View style={[styles.icon, !e.activa && { backgroundColor: color.surfaceSunk }]}><Icon name={(cat?.icono as IconName) || 'tool'} size={18} color={e.activa ? color.brandInk : color.inkMuted} /></View>
                  <View style={styles.flex}>
                    <Text variant="subtitle">{e.nombre}</Text>
                    <View style={styles.meta}>
                      <Pill label={verificada(e) ? 'Verificada' : e.estado === 'RECHAZADA' ? 'Rechazada' : 'En revisión'} tone={verificada(e) ? 'success' : e.estado === 'RECHAZADA' ? 'danger' : 'warning'} size="sm" />
                      <Text variant="caption" tone="muted">{e.activa ? 'Recibiendo' : 'En pausa'}</Text>
                    </View>
                  </View>
                  <Switch value={e.activa} onValueChange={(v) => toggle(e, v)} trackColor={{ false: color.lineStrong, true: color.brand }} thumbColor={color.surface} accessibilityLabel={`Recibir solicitudes de ${e.nombre}`} />
                  <IconButton icon="trash-2" label={`Quitar ${e.nombre}`} size={18} onPress={() => remove(e)} />
                </View>
              </View>
            );
          })}
        </Surface>
      ) : null}

      {disponibles.length ? (
        <>
          <SectionHeader title="Agregar" />
          <View style={styles.chips}>
            {disponibles.map((c) => <Chip key={c.codigo} label={c.nombre} icon="plus" onPress={() => add(c.codigo)} disabled={busy === c.codigo} />)}
          </View>
          <Text variant="caption" tone="muted" style={styles.note}>Las nuevas especialidades quedan en revisión hasta validar tus certificaciones.</Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  icon: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  note: { marginTop: space.md },
});
