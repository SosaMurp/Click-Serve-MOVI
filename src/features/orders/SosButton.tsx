import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { color, elevation, font, Text } from '../../design';
import { solicitudesApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { currentLocation, hapticWarning } from '../../lib/media';
import { useOperationKey } from '../../lib/useOperationKey';
import { dialog } from '../../ui/dialog';

// RF-100: botón SOS siempre por encima del contenido (RNF-31), con confirmación y ubicación.
export function SosButton({ idSolicitud, bottom = 96 }: { idSolicitud: number; bottom?: number }) {
  const [sending, setSending] = useState(false);
  const key = useOperationKey();

  const send = async () => {
    const ok = await dialog.confirm({
      title: '¿Enviar alerta SOS?',
      message: 'Avisaremos de inmediato al equipo de seguridad de Click & Serve con tu ubicación. Si tu vida corre peligro, llama también al 911.',
      confirmText: 'Enviar SOS',
      destructive: true,
    });
    if (!ok) return;
    setSending(true);
    hapticWarning();
    try {
      const pos = await currentLocation();
      const res = await solicitudesApi.sos(idSolicitud, pos?.latitude ?? null, pos?.longitude ?? null, key.get());
      key.reset();
      const call = await dialog.confirm({
        title: 'Alerta enviada',
        message: `${res.mensaje} Reporte ${res.incidencia.folio}.`,
        confirmText: 'Llamar al 911',
        cancelText: 'Cerrar',
        destructive: true,
      });
      if (call) Linking.openURL('tel:911');
    } catch (e) {
      const call = await dialog.confirm({ title: 'No se pudo enviar la alerta', message: `${errorMessage(e)} Llama al 911 si estás en peligro.`, confirmText: 'Llamar al 911', destructive: true });
      if (call) Linking.openURL('tel:911');
    } finally {
      setSending(false);
    }
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Botón SOS: enviar alerta de emergencia" onPress={send} disabled={sending} style={({ pressed }) => [styles.fab, pressed && { backgroundColor: color.dangerInk }]}>
        {sending ? <ActivityIndicator color={color.inkOnColor} /> : <Text style={styles.label}>SOS</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, zIndex: 100, elevation: 12 },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: color.surface, ...elevation[2] },
  label: { fontFamily: font.headingBold, fontSize: 18, lineHeight: 22, color: color.inkOnColor },
});
