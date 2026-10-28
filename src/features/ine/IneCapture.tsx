import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { Button, color, Icon, radius, space, Text } from '../../design';
import type { IneRegistro, LocalFile } from '../../api/types';
import { authApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { IneCamera } from './IneCamera';

export type IneValue = { file: LocalFile; ticket: string };

type Props = {
  step: number;
  lado: 'frente' | 'reverso';
  registro: IneRegistro;
  ticketFrente?: string;
  disabled?: boolean;
  value: IneValue | null;
  onChange: (v: IneValue | null) => void;
};

// RF-25: captura de la INE con verificación al momento. La foto sale de la cámara (no de la galería),
// se manda a POST /api/ine/verificar y solo se acepta si el servidor la reconoce como una INE con
// datos coherentes; el ticket que devuelve lo exige el registro.
export function IneCapture({ step, lado, registro, ticketFrente, disabled, value, onChange }: Props) {
  const [camera, setCamera] = useState(false);
  const [checking, setChecking] = useState<LocalFile | null>(null);
  const [error, setError] = useState<{ file: LocalFile; motivo: string } | null>(null);
  const title = lado === 'frente' ? 'INE · frente' : 'INE · reverso';

  const verify = async (file: LocalFile) => {
    setCamera(false);
    setChecking(file);
    setError(null);
    onChange(null);
    try {
      const r = await authApi.verificarIne(lado, file, registro, ticketFrente);
      if (r.ok && r.ticket) onChange({ file, ticket: r.ticket });
      else setError({ file, motivo: r.motivo || 'No pudimos verificar tu credencial. Toma la foto otra vez.' });
    } catch (e) {
      setError({ file, motivo: errorMessage(e, 'No pudimos revisar tu credencial. Revisa tu conexión y vuelve a intentar.') });
    } finally {
      setChecking(null);
    }
  };

  const preview = value?.file || checking || error?.file;
  return (
    <View style={[styles.tile, value && styles.tileOk, error && styles.tileError, disabled && styles.tileOff]} accessibilityState={{ disabled: !!disabled }}>
      <View style={styles.head}>
        <View style={[styles.num, value && styles.numOk]}>
          {value ? <Icon name="check" size={16} color={color.inkOnColor} /> : <Text variant="label" tone={disabled ? 'muted' : 'default'}>{step}</Text>}
        </View>
        <View style={styles.flex}>
          <Text variant="subtitle" tone={disabled ? 'muted' : 'default'}>{title}</Text>
          <Text variant="bodySm" tone="muted">{lado === 'frente' ? 'Que se lean tu nombre, tu CURP y tu foto.' : 'Que se lean las 3 líneas de letras y números de abajo.'}</Text>
        </View>
      </View>

      {preview ? <Image source={{ uri: preview.uri }} style={styles.preview} accessibilityLabel={`Foto: ${title}`} /> : null}

      {checking ? (
        <View style={styles.status} accessibilityLiveRegion="polite">
          <ActivityIndicator color={color.ink} />
          <Text variant="body" weight="600">Revisando tu credencial…</Text>
        </View>
      ) : value ? (
        <View style={styles.status}>
          <Icon name="check-circle" size={20} color={color.successInk} />
          <Text variant="body" weight="700" tone="success" style={styles.flex}>Credencial verificada</Text>
          <Button title="Repetir" variant="text" onPress={() => setCamera(true)} />
        </View>
      ) : error ? (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <View style={styles.status}>
            <Icon name="alert-circle" size={20} color={color.dangerInk} />
            <Text variant="body" tone="danger" style={styles.flex}>{error.motivo}</Text>
          </View>
          <Button title="Tomar otra vez" variant="accent" icon="camera" onPress={() => setCamera(true)} full size="lg" />
        </View>
      ) : !disabled ? (
        <Button title="Tomar foto" variant="accent" icon="camera" onPress={() => setCamera(true)} full size="lg" />
      ) : null}

      {camera ? <IneCamera visible={camera} lado={lado} onCapture={verify} onClose={() => setCamera(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tile: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.lineStrong, borderRadius: radius.md, padding: space.lg, gap: space.md, marginBottom: space.md },
  tileOk: { borderStyle: 'solid', borderColor: color.success, backgroundColor: color.successSoft },
  tileError: { borderStyle: 'solid', borderColor: color.danger },
  tileOff: { opacity: 0.6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  num: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  numOk: { backgroundColor: color.success, borderColor: color.success },
  preview: { width: '100%', aspectRatio: 85.6 / 54, borderRadius: radius.sm, backgroundColor: color.groundAlt },
  status: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  errorBox: { gap: space.md },
});
