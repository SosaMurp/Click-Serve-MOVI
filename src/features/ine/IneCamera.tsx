import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, color, radius, space, Text } from '../../design';
import type { LocalFile } from '../../api/types';
import { CARD_RATIO } from '../../lib/frameAnalysis';
import { compressImage, MediaPermissionError, pickImages } from '../../lib/media';
import { dialog } from '../../ui/dialog';

type Props = { visible: boolean; lado: 'frente' | 'reverso'; onCapture: (f: LocalFile) => void; onClose: () => void };
type CameraModule = typeof import('expo-camera');

// expo-camera se carga solo aquí: las builds instaladas antes de este cambio no lo traen y,
// en ese caso, se usa la cámara del sistema (sin marco) y la verificación del servidor igual decide.
let cameraModule: CameraModule | null | undefined;
function loadCamera(): CameraModule | null {
  if (cameraModule === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cameraModule = require('expo-camera') as CameraModule;
    } catch {
      cameraModule = null;
    }
  }
  return cameraModule;
}

// Cámara de la INE en la app instalada: marco con la proporción de la credencial y disparo manual.
// El análisis cuadro por cuadro solo existe en web (IneCamera.web.tsx); aquí la foto se revisa
// en el servidor al instante de tomarla.
export function IneCamera(props: Props) {
  const mod = loadCamera();
  return mod ? <NativeCamera mod={mod} {...props} /> : <SystemCamera {...props} />;
}

function NativeCamera({ mod, visible, lado, onCapture, onClose }: Props & { mod: CameraModule }) {
  const { CameraView, useCameraPermissions } = mod;
  const [perm, requestPerm] = useCameraPermissions();
  const ref = useRef<InstanceType<typeof CameraView>>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible && perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [visible, perm, requestPerm]);

  const take = async () => {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      const pic = await ref.current.takePictureAsync({ quality: 0.85, shutterSound: false });
      onCapture(await compressImage(pic.uri, pic.width));
    } catch {
      dialog.alert('No se pudo tomar la foto', 'Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <Text variant="headline" tone="onColor" align="center">{lado === 'frente' ? 'Frente de tu credencial' : 'Reverso de tu credencial'}</Text>
        {perm?.granted ? (
          <View style={styles.cam}>
            <CameraView ref={ref} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setReady(true)} />
            <View pointerEvents="none" style={styles.frameWrap}>
              <View style={styles.frame} />
            </View>
          </View>
        ) : (
          <View style={styles.perm}>
            <Text variant="bodyLg" tone="onColor" align="center">Para verificar tu credencial necesitamos la cámara.</Text>
            <Button title="Permitir la cámara" variant="white" onPress={requestPerm} full size="xl" />
          </View>
        )}
        <Text variant="bodyLg" tone="onColor" align="center">
          Pon la credencial dentro del marco, con buena luz y sin reflejos. {lado === 'reverso' ? 'Que se lean las 3 líneas de abajo.' : 'Que se lean tu nombre y tu CURP.'}
        </Text>
        <Button title="Tomar foto" variant="accent" icon="camera" onPress={take} loading={busy} disabled={!ready} full size="xl" />
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel} hitSlop={8}>
          <Text variant="button" tone="onColor">Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// Sin expo-camera en la build: cámara del sistema. No hay galería para la INE.
function SystemCamera({ visible, onCapture, onClose }: Props) {
  useEffect(() => {
    if (!visible) return;
    pickImages({ camera: true })
      .then(([f]) => (f ? onCapture(f) : onClose()))
      .catch((e) => {
        dialog.alert('Permiso de cámara', e instanceof MediaPermissionError ? e.message : 'No se pudo usar la cámara.');
        onClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.navy, padding: space.lg, justifyContent: 'center', gap: space.md },
  cam: { width: '100%', aspectRatio: 3 / 4, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#000' },
  frameWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  frame: { width: '86%', aspectRatio: CARD_RATIO, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 12 },
  perm: { gap: space.md, padding: space.lg },
  cancel: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1.5, borderColor: '#FFFFFF' },
});
