import React, { useCallback } from 'react';
import { Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppBar, AppBarAction, Screen } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { soporteApi } from '@/src/api/endpoints';
import type { LocalFile, TicketMensaje } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { useRealtime } from '@/src/state/realtime';
import { ChatThread } from '@/src/features/chat/ChatThread';
import { SUPPORT_PHONE } from '@/src/features/help/content';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-107/113: chat con un asesor y escalación del caso.
export default function Ticket() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, setData, reload } = useLoader(() => soporteApi.mensajes(id), [id]);
  const ticket = data?.ticket;

  useRealtime('soporte.mensaje', useCallback((m: TicketMensaje) => {
    if (String(m.id_ticket) !== String(id)) return;
    setData((prev) => (prev && !prev.mensajes.some((x) => x.id_mensaje === m.id_mensaje) ? { ...prev, mensajes: [...prev.mensajes, m] } : prev));
  }, [id, setData]));

  async function send(text: string, file: LocalFile | null) {
    try {
      const { mensaje } = await soporteApi.enviar(id, text, file);
      setData((prev) => (prev && !prev.mensajes.some((x) => x.id_mensaje === mensaje.id_mensaje) ? { ...prev, mensajes: [...prev.mensajes, mensaje] } : prev));
      return true;
    } catch (e) {
      toast.error(errorMessage(e));
      return false;
    }
  }

  async function escalate() {
    const ok = await dialog.confirm({ title: '¿Escalar el caso?', message: 'Un supervisor lo atenderá con prioridad alta. Úsalo si no has recibido respuesta o es urgente.', confirmText: 'Escalar' });
    if (!ok) return;
    try {
      const r = await soporteApi.escalar(id);
      toast.success(r.mensaje);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const cerrado = ticket ? ['CERRADO', 'RESUELTO'].includes(ticket.estado) : false;
  const actions: AppBarAction[] = SUPPORT_PHONE ? [{ icon: 'phone', label: 'Llamar a soporte', onPress: () => Linking.openURL(`tel:${SUPPORT_PHONE}`) }] : [];
  if (ticket && ticket.estado !== 'ESCALADO' && !cerrado) actions.push({ icon: 'alert-octagon', label: 'Escalar caso', onPress: escalate });

  return (
    <Screen scroll={false} padded={false} header={<AppBar title={ticket?.asunto || 'Caso de soporte'} subtitle={ticket ? `${ticket.folio}${ticket.estado === 'ESCALADO' ? ' · Urgente' : ''}` : undefined} actions={actions} fallbackHref="/soporte" />}>
      <ChatThread
        items={(data?.mensajes || []).map((m) => ({
          id: m.id_mensaje,
          mine: !m.es_asesor,
          author: m.es_asesor ? 'Soporte Click & Serve' : undefined,
          text: m.mensaje,
          attachmentUrl: m.adjunto_url,
          attachmentType: m.adjunto_tipo,
          time: m.fecha_envio,
        }))}
        onSend={send}
        disabled={cerrado}
        disabledText="Este caso está cerrado. Si necesitas algo más, abre uno nuevo."
      />
    </Screen>
  );
}
