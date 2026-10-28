import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, color, Icon, radius, space, Text } from '../../design';
import type { LocalFile } from '../../api/types';
import { analyzeFrame, cardFrame, CONSEJOS, type Consejo, type Rect } from '../../lib/frameAnalysis';

type Props = { visible: boolean; lado: 'frente' | 'reverso'; onCapture: (f: LocalFile) => void; onClose: () => void };

const SAMPLE_W = 320;
const INTERVAL_MS = 250;
const STABLE = 4; // ~1 s seguido con todo bien antes del disparo automático
const MARGIN = 0.04; // margen alrededor del marco al recortar, para no cortar los bordes de la credencial

// Cámara en vivo para la INE en web (getUserMedia): marco con la proporción de la credencial,
// consejos en tiempo real y disparo automático cuando el documento llena el marco, nítido y quieto.
// La foto se recorta al marco. El servidor la verifica después con OCR.
export function IneCamera({ visible, lado, onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspect, setAspect] = useState(16 / 9);
  const [frame, setFrame] = useState<Rect | null>(null); // en fracciones del video (0-1)
  const [consejo, setConsejo] = useState<Consejo | null | 'cargando'>('cargando');
  const [streak, setStreak] = useState(0);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !frame) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const x = Math.max(0, (frame.x - MARGIN * frame.w) * vw);
    const y = Math.max(0, (frame.y - MARGIN * frame.h) * vh);
    const w = Math.min(vw - x, frame.w * (1 + 2 * MARGIN) * vw);
    const h = Math.min(vh - y, frame.h * (1 + 2 * MARGIN) * vh);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    canvas.getContext('2d')?.drawImage(video, x, y, w, h, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stop();
      onCapture({ uri: URL.createObjectURL(blob), name: `ine-${lado}.jpg`, type: 'image/jpeg' });
    }, 'image/jpeg', 0.92);
  }, [frame, lado, onCapture]);

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let ok = 0;
    setError(null);
    setConsejo('cargando');
    setStreak(0);

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Este navegador no deja usar la cámara aquí. Abre el link con https (como el que te compartimos) en Chrome o Safari.');
        return;
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch (e) {
        const name = (e as { name?: string })?.name;
        setError(name === 'NotAllowedError'
          ? 'Para verificar tu credencial necesitamos la cámara. Permite el acceso en el aviso del navegador y vuelve a intentar.'
          : 'No pudimos abrir la cámara. Revisa que ninguna otra app la esté usando y vuelve a intentar.');
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => {});

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      timer = setInterval(() => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh || !ctx) return;
        const sw = SAMPLE_W;
        const sh = Math.round((vh * SAMPLE_W) / vw);
        if (canvas.width !== sw) {
          canvas.width = sw;
          canvas.height = sh;
          setAspect(vw / vh);
          const f = cardFrame(sw, sh);
          setFrame({ x: f.x / sw, y: f.y / sh, w: f.w / sw, h: f.h / sh });
        }
        ctx.drawImage(video, 0, 0, sw, sh);
        const rgba = ctx.getImageData(0, 0, sw, sh).data;
        const gray = new Uint8ClampedArray(sw * sh);
        for (let i = 0, j = 0; i < rgba.length; i += 4, j += 1) gray[j] = (rgba[i] * 299 + rgba[i + 1] * 587 + rgba[i + 2] * 114) / 1000;
        const r = analyzeFrame(gray, sw, sh, cardFrame(sw, sh));
        setConsejo(r.consejo);
        ok = r.consejo ? 0 : ok + 1;
        setStreak(ok);
      }, INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stop();
    };
  }, [visible]);

  // Disparo automático: el documento estuvo bien ~1 s seguido.
  useEffect(() => {
    if (streak >= STABLE) capture();
  }, [streak, capture]);

  const ready = consejo === null;
  const mensaje = consejo === 'cargando' ? 'Abriendo la cámara…' : ready ? 'No te muevas, tomando la foto…' : CONSEJOS[consejo];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => { stop(); onClose(); }}>
      <View style={styles.screen}>
        <Text variant="headline" tone="onColor" align="center" style={styles.title}>
          {lado === 'frente' ? 'Frente de tu credencial' : 'Reverso de tu credencial'}
        </Text>
        <Text variant="bodyLg" tone="onColor" align="center" style={styles.sub}>
          {lado === 'frente' ? 'Que se lean tu nombre, tu CURP y tu foto.' : 'Que se lean las 3 líneas de letras y números de abajo.'}
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Icon name="camera-off" size={32} color={color.inkOnColor} />
            <Text variant="bodyLg" tone="onColor" align="center">{error}</Text>
          </View>
        ) : (
          <View style={[styles.video, { aspectRatio: aspect }]}>
            {React.createElement('video', {
              ref: videoRef,
              playsInline: true,
              muted: true,
              autoPlay: true,
              style: { width: '100%', height: '100%', objectFit: 'contain', background: '#000' },
            })}
            {frame ? (
              <View
                pointerEvents="none"
                style={[styles.frame, ready ? styles.frameOk : null, {
                  left: `${frame.x * 100}%`, top: `${frame.y * 100}%`, width: `${frame.w * 100}%`, height: `${frame.h * 100}%`,
                }]}
              />
            ) : null}
          </View>
        )}

        {!error ? (
          <View style={[styles.hint, ready ? styles.hintOk : null]} accessibilityLiveRegion="polite">
            <Icon name={ready ? 'check-circle' : 'info'} size={22} color={ready ? color.inkOnColor : color.ink} />
            <Text variant="bodyLg" weight="700" style={{ color: ready ? color.inkOnColor : color.ink, flexShrink: 1 }}>{mensaje}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {!error ? <Button title="Tomar foto ahora" variant="white" icon="camera" onPress={capture} full size="xl" /> : null}
          <Pressable accessibilityRole="button" onPress={() => { stop(); onClose(); }} style={styles.cancel} hitSlop={8}>
            <Text variant="button" tone="onColor">Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.navy, padding: space.lg, justifyContent: 'center', gap: space.md },
  title: { marginTop: space.md },
  sub: { opacity: 0.9 },
  video: { width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: '#000', borderRadius: radius.md, overflow: 'hidden' },
  frame: { position: 'absolute', borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 12, borderStyle: 'dashed' },
  frameOk: { borderColor: '#3DDC84', borderStyle: 'solid' },
  errorBox: { alignItems: 'center', gap: space.md, padding: space.xl },
  hint: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: radius.md, paddingHorizontal: space.lg, paddingVertical: space.md, maxWidth: 560 },
  hintOk: { backgroundColor: color.success },
  actions: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: space.sm },
  cancel: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1.5, borderColor: '#FFFFFF' },
});
