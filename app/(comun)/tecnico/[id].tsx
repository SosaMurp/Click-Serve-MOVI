import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import {
  AppBar, Avatar, Banner, Button, color, Divider, EmptyState, ListItem, MetricBox, Pill, radius, RatingStars, Screen, SectionHeader, Skeleton, space, Surface, Text,
} from '@/src/design';
import { errorMessage, fileUrl } from '@/src/api/client';
import { solicitudesApi, tecnicoApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { formatDate, formatRelative } from '@/src/lib/format';
import { hapticSuccess } from '@/src/lib/media';
import { Gallery } from '@/src/features/orders/Gallery';
import { useSession } from '@/src/state/session';
import { toast } from '@/src/ui/toast';

// RF-20: perfil público del técnico (calificación, reseñas, especialidades, portafolio y certificaciones).
export default function PerfilTecnico() {
  const { id, solicitud } = useLocalSearchParams<{ id: string; solicitud?: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { data: t, loading, error } = useLoader(() => tecnicoApi.perfil(id).then((r) => r.tecnico), [id]);
  const [sending, setSending] = useState(false);
  const canChoose = !!solicitud && user?.rol === 'cliente';

  async function choose() {
    if (!solicitud || !t) return;
    setSending(true);
    try {
      const r = await solicitudesApi.proponer(solicitud, t.id_usuario);
      hapticSuccess();
      toast.success(r.mensaje);
      goBack(router);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  const rating = t?.calificacion ? Number(t.calificacion) : 0;

  return (
    <Screen
      header={<AppBar title="Perfil del técnico" />}
      footer={canChoose && t ? <Button variant="accent" title={`Elegir a ${t.nombre}`} icon="check" onPress={choose} loading={sending} disabled={!t.disponible} full size="lg" /> : undefined}
    >
      {loading ? <Skeleton height={260} /> : null}
      {error && !t ? <Banner tone="error" title="No pudimos cargar el perfil" body={error} /> : null}
      {t ? (
        <>
          <Surface padded={false} style={styles.card}>
            <View style={styles.band} />
            <View style={styles.body}>
              <View style={styles.avatar}><Avatar uri={fileUrl(t.foto_url)} nombre={t.nombre} apellido={t.apellido} size={92} ring /></View>
              <Text variant="headline" align="center">{t.nombre} {t.apellido}</Text>
              <View style={styles.rating}>
                {rating ? <RatingStars value={rating} size={18} /> : null}
                <Text variant="label" tone="soft">{rating ? `${t.calificacion} · ${t.resenas_total} reseña${t.resenas_total === 1 ? '' : 's'}` : 'Sin reseñas aún'}</Text>
              </View>
              <View style={styles.pills}>
                <Pill label={t.disponible ? 'Disponible' : 'Desconectado'} tone={t.disponible ? 'success' : 'neutral'} size="sm" />
                {t.identidad_verificada ? <Pill label="Identidad verificada" tone="success" size="sm" icon="shield" /> : null}
                {t.verificado_sep ? <Pill label="Cédula SEP" tone="brand" size="sm" icon="award" /> : null}
              </View>
              <Text variant="caption" tone="muted">Miembro desde {formatDate(t.miembro_desde)}</Text>
            </View>
          </Surface>

          <Surface tint="sky" style={styles.metrics}>
            <View style={styles.row}>
              <MetricBox value={t.trabajos} label="Trabajos" tone="brand" />
              <MetricBox value={t.calificacion || '—'} label="Calificación" />
              <MetricBox value={t.efectividad != null ? `${t.efectividad}%` : '—'} label="Efectividad" />
            </View>
          </Surface>

          {t.bio ? (
            <>
              <SectionHeader title="Sobre mí" />
              <Surface><Text variant="body">{t.bio}</Text></Surface>
            </>
          ) : null}

          <SectionHeader title="Especialidades" />
          <View style={styles.chips}>
            {t.especialidades.length
              ? t.especialidades.map((e) => <Pill key={e.codigo} label={e.nombre} tone={['VERIFICADA', 'APROBADA'].includes(e.estado) ? 'brand' : 'neutral'} icon={['VERIFICADA', 'APROBADA'].includes(e.estado) ? 'check' : undefined} />)
              : <Text variant="body" tone="muted">Atiende servicios generales.</Text>}
          </View>

          {t.portafolio.length ? (
            <>
              <SectionHeader title="Trabajos anteriores" />
              <Gallery items={t.portafolio.map((p) => ({ url: p.url, label: p.titulo }))} size={120} />
            </>
          ) : null}

          {t.certificaciones.length ? (
            <>
              <SectionHeader title="Certificaciones" />
              <Surface padded={false}>
                {t.certificaciones.map((c, i) => (
                  <ListItem key={`${c.tipo}${i}`} icon="award" iconTone="success" title={c.descripcion || c.tipo} subtitle={c.numero ? `No. ${c.numero}` : undefined} />
                ))}
              </Surface>
            </>
          ) : null}

          <SectionHeader title="Reseñas" />
          {t.resenas.length ? (
            <Surface>
              {t.resenas.map((r, i) => (
                <View key={i}>
                  {i ? <Divider /> : null}
                  <View style={styles.review}>
                    <View style={styles.reviewHead}>
                      <Text variant="subtitle" style={styles.flex}>{r.cliente}</Text>
                      <Text variant="caption" tone="muted">{formatRelative(r.fecha)}</Text>
                    </View>
                    <RatingStars value={r.puntuacion} size={14} />
                    {r.comentario ? <Text variant="bodySm" tone="soft">{r.comentario}</Text> : null}
                  </View>
                </View>
              ))}
            </Surface>
          ) : <EmptyState icon="message-square" title="Aún sin reseñas" body="Este técnico todavía no recibe calificaciones." />}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { overflow: 'hidden' },
  band: { height: 76, backgroundColor: color.brandSoft },
  body: { alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.lg, gap: 6 },
  avatar: { marginTop: -50, marginBottom: space.xs, borderRadius: radius.full },
  rating: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, marginVertical: space.xs },
  metrics: { marginTop: space.md },
  row: { flexDirection: 'row', gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  review: { paddingVertical: space.sm, gap: 4 },
  reviewHead: { flexDirection: 'row', alignItems: 'center' },
});
