import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppBar, Banner, Button, Checkbox, color, Icon, Money, radius, RatingStars, Screen, SectionHeader, Skeleton, space, Surface, Text, TextField,
} from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { pagosApi, solicitudesApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { hapticSuccess } from '@/src/lib/media';
import { useOperationKey } from '@/src/lib/useOperationKey';
import { EvidenceFeed } from '@/src/features/orders/Gallery';
import { QuoteCard } from '@/src/features/orders/QuoteCard';
import { useSolicitud } from '@/src/features/orders/hooks';
import { toast } from '@/src/ui/toast';

// RF-53/54/69/70: revisar evidencia, elegir tarjeta, calificar y "Enviar y finalizar" (único punto de cobro).
export default function Confirmar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: s, loading } = useSolicitud(id);
  const tarjetas = useLoader(() => pagosApi.tarjetas().then((r) => r.metodos), []);
  const key = useOperationKey();
  const [metodo, setMetodo] = useState<number | null>(null);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [conforme, setConforme] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const list = tarjetas.data || [];
    if (!metodo && list.length) setMetodo((list.find((t) => t.predeterminada) || list[0]).id_metodo);
  }, [tarjetas.data, metodo]);

  async function submit() {
    if (!metodo) return;
    setSending(true);
    try {
      const r = await solicitudesApi.confirmar(id, { id_metodo: metodo, calificacion: estrellas || undefined, comentario: comentario.trim() || undefined }, key.get());
      key.reset();
      hapticSuccess();
      toast.success(r.mensaje);
      router.replace({ pathname: '/orden/[id]/comprobante', params: { id } });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  if (!s) return <Screen header={<AppBar title="Confirma y paga" />}>{loading ? <Skeleton height={300} /> : null}</Screen>;
  if (s.estado !== 'POR_CONFIRMAR') {
    return (
      <Screen header={<AppBar title="Confirma y paga" />}>
        <Banner tone="info" title={s.estado === 'FINALIZADA' ? 'Este servicio ya está pagado' : 'Aún no se puede confirmar'} body="Regresa al seguimiento de la orden." action={<Button title="Ver orden" variant="text" onPress={() => router.replace({ pathname: '/orden/[id]', params: { id } })} />} />
      </Screen>
    );
  }

  const list = tarjetas.data || [];
  const done = (s.tareas || []).filter((t) => t.completada).length;

  return (
    <Screen
      header={<AppBar title="Confirma y paga" subtitle={s.folio} />}
      footer={(
        <View style={styles.footer}>
          <View style={styles.total}>
            <Text variant="caption" tone="muted">Total a pagar</Text>
            <Money value={s.monto_total} size="lg" />
          </View>
          <Button variant="accent" title="Enviar y finalizar" icon="check-circle" onPress={submit} loading={sending} disabled={!conforme || !metodo} size="lg" style={styles.flex} />
        </View>
      )}
    >
      <Surface tint="peach">
        <Text variant="title">Revisa que todo quedó bien</Text>
        <Text variant="bodySm" tone="soft">El cobro se hace solo cuando confirmas. Si algo no quedó, repórtalo y no se te cobra mientras se resuelve.</Text>
      </Surface>

      {s.evidencias?.length ? (
        <>
          <SectionHeader title="Así quedó" />
          <EvidenceFeed items={s.evidencias} />
        </>
      ) : <Banner tone="warning" title="Sin fotos de evidencia" body="Pide al técnico que suba fotos del trabajo terminado antes de confirmar." style={styles.gap} />}

      {s.tareas?.length ? <Text variant="bodySm" tone="muted" style={styles.gap}>{done} de {s.tareas.length} tareas de seguridad marcadas como hechas.</Text> : null}

      <SectionHeader title="Resumen" />
      <QuoteCard cotizacion={s.cotizacion} extras={s.extras} total={s.monto_total} title="Conceptos" />

      <SectionHeader title="Paga con" action="Agregar tarjeta" onAction={() => router.push('/tarjeta-nueva')} />
      {tarjetas.loading ? <Skeleton height={72} /> : null}
      {!tarjetas.loading && !list.length ? (
        <Banner tone="warning" title="No tienes tarjetas guardadas" body="Agrega una tarjeta para pagar el servicio." action={<Button title="Agregar tarjeta" icon="plus" variant="text" onPress={() => router.push('/tarjeta-nueva')} />} />
      ) : null}
      <View style={styles.cards} accessibilityRole="radiogroup">
        {list.map((t) => {
          const on = metodo === t.id_metodo;
          return (
            <Pressable key={t.id_metodo} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${t.marca} terminación ${t.ultimos_4}`} onPress={() => setMetodo(t.id_metodo)} style={[styles.card, on && styles.cardOn]}>
              <View style={styles.cardIcon}><Icon name="credit-card" size={20} color={color.brandInk} /></View>
              <View style={styles.flex}>
                <Text variant="subtitle">{t.marca} •••• {t.ultimos_4}</Text>
                <Text variant="caption" tone="muted">{t.titular} · vence {t.expiracion}</Text>
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Califica al técnico (opcional)" />
      <Surface>
        <RatingStars value={estrellas} onChange={setEstrellas} size={36} label="Calificación del técnico" />
        <View style={styles.gap}>
          <TextField label="Comentario" value={comentario} onChangeText={setComentario} placeholder="¿Qué tal el servicio?" multiline maxLength={500} counter />
        </View>
      </Surface>

      <View style={styles.gap}>
        <Checkbox checked={conforme} onChange={setConforme}>
          <Text variant="body">Confirmo que el trabajo quedó terminado y autorizo el cobro de este total.</Text>
        </Checkbox>
      </View>
      <Button title="Algo no quedó bien" icon="alert-triangle" variant="text" onPress={() => router.push({ pathname: '/orden/[id]/incidencia', params: { id } })} style={styles.center} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginTop: space.md },
  center: { alignSelf: 'center', marginTop: space.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  total: { minWidth: 110 },
  cards: { gap: space.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.md, backgroundColor: color.surface, borderWidth: 2, borderColor: 'transparent' },
  cardOn: { borderColor: color.accent, backgroundColor: color.accentSoft },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: color.accentPressed },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: color.accentPressed },
});
