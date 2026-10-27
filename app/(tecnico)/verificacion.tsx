import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppBar, Banner, Button, Chip, color, EmptyState, Icon, ListItem, Pill, radius, Screen, SectionHeader, Sheet, SkeletonList, space, Surface, Text, TextField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { cuentaApi, tecnicoApi } from '@/src/api/endpoints';
import type { LocalFile } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { formatDate } from '@/src/lib/format';
import { hapticSuccess, MediaPermissionError, pickDocument, pickImages } from '@/src/lib/media';
import { useSession } from '@/src/state/session';
import { toast } from '@/src/ui/toast';

const TIPOS = [
  { value: 'CERTIFICACION', label: 'Certificación' },
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'COMPROBANTE_DOMICILIO', label: 'Comprobante de domicilio' },
  { value: 'ANTECEDENTES', label: 'Carta de antecedentes' },
];
const TIPO_LABEL: Record<string, string> = { INE_FRENTE: 'INE (frente)', INE_REVERSO: 'INE (reverso)', ROSTRO: 'Foto de rostro', ...Object.fromEntries(TIPOS.map((t) => [t.value, t.label])) };

function estadoPill(estado: string) {
  if (estado === 'APROBADO') return <Pill label="Aprobado" tone="success" size="sm" />;
  if (estado === 'RECHAZADO') return <Pill label="Rechazado" tone="danger" size="sm" />;
  return <Pill label="En revisión" tone="warning" size="sm" />;
}

// RF-25: identidad, biometría y documentos del técnico.
export default function Verificacion() {
  const { user, refresh } = useSession();
  const docs = useLoader(() => tecnicoApi.documentos().then((r) => r.documentos), []);
  const [bioBusy, setBioBusy] = useState(false);
  const [upload, setUpload] = useState<{ tipo: string; numero: string; descripcion: string; archivo: LocalFile | null } | null>(null);
  const [sending, setSending] = useState(false);

  async function biometric() {
    setBioBusy(true);
    try {
      const { verificacion } = await cuentaApi.startBiometric();
      const [selfie] = await pickImages({ camera: true, front: true, max: 1 });
      if (!selfie) return;
      const r = await cuentaApi.compareBiometric(verificacion.id_verificacion, selfie);
      if (r.match) { hapticSuccess(); toast.success('Tu rostro coincide con tu registro. El equipo de verificación revisará tu INE.'); refresh(); }
      else toast.warning('No pudimos confirmar que eres tú. Intenta con buena luz y sin lentes.');
    } catch (e) {
      toast.error(e instanceof MediaPermissionError ? e.message : errorMessage(e));
    } finally {
      setBioBusy(false);
    }
  }

  async function send() {
    if (!upload?.archivo) return;
    setSending(true);
    try {
      const r = await tecnicoApi.subirDocumento(upload.archivo, upload.tipo, upload.numero.trim() || undefined, upload.descripcion.trim() || undefined);
      toast.success(r.mensaje || 'Documento enviado a revisión.');
      setUpload(null);
      docs.reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  const list = docs.data || [];
  const bioOk = ['verificada', 'aprobado'].includes(String(user?.biometria_estado || '').toLowerCase());
  return (
    <Screen header={<AppBar title="Verificación" />} footer={<Button title="Subir documento" icon="upload" onPress={() => setUpload({ tipo: 'CERTIFICACION', numero: '', descripcion: '', archivo: null })} full size="lg" />}>
      <Surface tint={user?.aprobado ? 'sky' : 'peach'}>
        <View style={styles.row}>
          <View style={styles.icon}><Icon name={user?.aprobado ? 'check-circle' : 'clock'} size={22} color={user?.aprobado ? color.successInk : color.accentInk} /></View>
          <View style={styles.flex}>
            <Text variant="title">{user?.aprobado ? 'Cuenta aprobada' : 'Cuenta en revisión'}</Text>
            <Text variant="bodySm" tone="soft">{user?.aprobado ? 'Puedes aceptar trabajos.' : 'Revisamos tus documentos; te avisaremos al aprobarla.'}</Text>
          </View>
        </View>
      </Surface>

      <SectionHeader title="Identidad" />
      <Surface padded={false}>
        <ListItem icon="credit-card" iconTone={user?.identidad_verificada ? 'success' : 'warning'} title="INE" subtitle={user?.identidad_verificada ? 'Verificada' : 'Pendiente de revisión'} />
        <ListItem
          icon="user-check"
          iconTone={bioOk ? 'success' : 'warning'}
          title="Biometría facial"
          subtitle={bioOk ? 'Tu rostro coincide con tu foto de registro' : 'Confirma que eres tú con una selfie'}
          trailing={bioOk ? <Pill label="Aprobada" tone="success" size="sm" /> : undefined}
        />
      </Surface>
      {!bioOk ? (
        <Button title="Verificar con una selfie" icon="camera" variant="tonal" onPress={biometric} loading={bioBusy} full style={styles.mt} />
      ) : null}

      <SectionHeader title="Documentos" />
      {docs.loading ? <SkeletonList rows={2} /> : null}
      {!docs.loading && !list.length ? <EmptyState icon="file-text" title="Sin documentos" body="Sube certificaciones para verificar tus especialidades." /> : null}
      {list.length ? (
        <Surface padded={false}>
          {list.map((d) => (
            <ListItem key={d.id_documento} icon="file-text" iconTone="brand" title={TIPO_LABEL[d.tipo] || d.tipo} subtitle={[d.numero, d.descripcion, formatDate(d.fecha_creacion)].filter(Boolean).join(' · ')} trailing={estadoPill(d.estado)} />
          ))}
        </Surface>
      ) : null}
      <Banner tone="info" title="Tus documentos están protegidos" body="Solo el equipo de verificación puede verlos; nunca se muestran a los clientes." style={styles.mt} />

      <Sheet visible={!!upload} onClose={() => setUpload(null)} title="Subir documento" footer={<Button title="Enviar a revisión" icon="send" onPress={send} loading={sending} disabled={!upload?.archivo} full />}>
        {upload ? (
          <>
            <View style={styles.chips}>
              {TIPOS.map((t) => <Chip key={t.value} label={t.label} selected={upload.tipo === t.value} onPress={() => setUpload({ ...upload, tipo: t.value })} />)}
            </View>
            <TextField label="Número o folio (opcional)" value={upload.numero} onChangeText={(v) => setUpload({ ...upload, numero: v })} maxLength={40} />
            <TextField label="Descripción (opcional)" value={upload.descripcion} onChangeText={(v) => setUpload({ ...upload, descripcion: v })} maxLength={150} placeholder="Ej. Certificación CONOCER en instalaciones eléctricas" />
            {upload.archivo ? (
              <View style={styles.file}>
                <Icon name="file" size={18} color={color.brandInk} />
                <Text variant="label" numberOfLines={1} style={styles.flex}>{upload.archivo.name}</Text>
                <Button title="Cambiar" variant="text" onPress={async () => { const f = await pickDocument().catch(() => null); if (f) setUpload({ ...upload, archivo: f }); }} />
              </View>
            ) : (
              <Button title="Elegir archivo (foto o PDF)" icon="paperclip" variant="tonal" onPress={async () => { const f = await pickDocument().catch(() => null); if (f) setUpload({ ...upload, archivo: f }); }} full />
            )}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  mt: { marginTop: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
  file: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.brandSoft, borderRadius: radius.md, paddingLeft: space.md },
});
