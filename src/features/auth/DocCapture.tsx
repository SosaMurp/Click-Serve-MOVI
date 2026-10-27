import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { Button, color, Icon, IconName, radius, space, Text } from '../../design';
import type { LocalFile } from '../../api/types';
import { MediaPermissionError, pickImages } from '../../lib/media';
import { dialog } from '../../ui/dialog';

type Props = {
  step: number;
  title: string;
  hint: string;
  icon: IconName;
  file: LocalFile | null;
  onChange: (f: LocalFile | null) => void;
  front?: boolean;
  disabled?: boolean;
};

// RF-25: captura secuencial de documentos. Sin foto real no se avanza (ya no hay imagen simulada).
export function DocCapture({ step, title, hint, icon, file, onChange, front, disabled }: Props) {
  const take = async (camera: boolean) => {
    try {
      const [f] = await pickImages({ camera, front });
      if (f) onChange(f);
    } catch (e) {
      if (e instanceof MediaPermissionError) dialog.alert('Permiso de cámara', e.message);
      else dialog.alert('No se pudo usar la cámara', 'Intenta de nuevo o elige la foto desde tu galería.');
    }
  };

  return (
    <View style={[styles.tile, file && styles.tileDone, disabled && styles.tileOff]} accessibilityState={{ disabled: !!disabled }}>
      <View style={styles.head}>
        <View style={[styles.num, file && styles.numDone]}>
          {file ? <Icon name="check" size={16} color={color.inkOnColor} /> : <Text variant="label" tone={disabled ? 'muted' : 'brand'}>{step}</Text>}
        </View>
        <View style={styles.flex}>
          <Text variant="subtitle" tone={disabled ? 'muted' : 'default'}>{title}</Text>
          <Text variant="bodySm" tone="muted">{hint}</Text>
        </View>
        {!file ? <Icon name={icon} size={28} color={disabled ? color.lineStrong : color.brandInk} /> : null}
      </View>
      {file ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: file.uri }} style={styles.preview} accessibilityLabel={`Vista previa: ${title}`} />
          <Button title="Repetir" variant="outlined" icon="refresh-cw" onPress={() => take(true)} />
        </View>
      ) : !disabled ? (
        <View style={styles.actions}>
          <Button title={Platform.OS === 'web' ? 'Subir foto' : 'Tomar foto'} icon="camera" onPress={() => take(true)} />
          {Platform.OS !== 'web' ? <Button title="Galería" variant="outlined" icon="image" onPress={() => take(false)} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tile: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.lineStrong, borderRadius: radius.md, padding: space.lg, gap: space.md, marginBottom: space.md },
  tileDone: { borderStyle: 'solid', borderColor: color.success, backgroundColor: color.successSoft },
  tileOff: { opacity: 0.6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  num: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: color.brand, alignItems: 'center', justifyContent: 'center' },
  numDone: { backgroundColor: color.success, borderColor: color.success },
  actions: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  preview: { width: 96, height: 64, borderRadius: radius.sm, backgroundColor: color.groundAlt },
});
