import React, { useCallback } from 'react';
import { Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar, AppBarAction, Screen } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { solicitudesApi } from '@/src/api/endpoints';
import type { ChatMensaje } from '@/src/api/types';
import { useLoader } from '@/src/lib/useLoader';
import { useRealtime } from '@/src/state/realtime';
import { useSession } from '@/src/state/session';
import { ChatThread } from '@/src/features/chat/ChatThread';
import { useSolicitud } from '@/src/features/orders/hooks';
import { isActive } from '@/src/lib/estado';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-108/112/113: chat de la orden entre cliente y técnico, con llamada y escalación a seguridad.
export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const orden = useSolicitud(id);
  const chat = useLoader(() => solicitudesApi.chat(id).then((r) => r.mensajes), [id]);
  const { setData } = chat;
  const s = orden.data;
  const soyCliente = user?.rol === 'cliente';

  useRealtime('chat.mensaje', useCallback((m: ChatMensaje) => {
    if (String(m.id_solicitud) !== String(id)) return;
    setData((prev) => (prev && !prev.some((x) => x.id === m.id) ? [...prev, m] : prev));
  }, [id, setData]));

  const otro = s ? (soyCliente ? (s.tecnico ? `${s.tecnico.nombre} ${s.tecnico.apellido}` : 'Técnico') : `${s.cliente_nombre || 'Cliente'} ${s.cliente_apellido || ''}`.trim()) : 'Chat';
  const telefono = soyCliente ? s?.tecnico?.telefono : s?.cliente_telefono;
  const cerrado = !!s && !isActive(s.estado);

  async function send(text: string, file: Parameters<typeof solicitudesApi.enviarMensaje>[2]) {
    try {
      const { mensaje } = await solicitudesApi.enviarMensaje(id, text, file);
      setData((prev) => (prev && !prev.some((x) => x.id === mensaje.id) ? [...prev, mensaje] : prev || [mensaje]));
      return true;
    } catch (e) {
      toast.error(errorMessage(e));
      return false;
    }
  }

  async function escalate() {
    const motivo = await dialog.prompt({
      title: 'Escalar a seguridad',
      message: 'Un asesor de seguridad revisará esta conversación de inmediato. Usa esta opción si te sientes amenazado o hay un comportamiento inapropiado.',
      placeholder: 'Qué está pasando (opcional)',
      confirmText: 'Escalar',
    });
    if (motivo === null) return;
    try {
      const r = await solicitudesApi.escalar(id, motivo.trim());
      toast.success(`${r.mensaje} Caso ${r.ticket.folio}.`);
      router.push({ pathname: '/soporte/[id]', params: { id: String(r.ticket.id_ticket) } });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const actions: AppBarAction[] = [];
  if (telefono && !cerrado) actions.push({ icon: 'phone', label: `Llamar a ${otro}`, onPress: () => Linking.openURL(`tel:${telefono}`) });
  actions.push({ icon: 'shield', label: 'Escalar a seguridad', onPress: escalate });

  return (
    <Screen scroll={false} padded={false} header={<AppBar title={otro} subtitle={s ? `${s.categoria_nombre} · ${s.folio}` : undefined} actions={actions} />}>
      <ChatThread
        items={(chat.data || []).map((m) => ({
          id: m.id,
          mine: m.id_emisor === user?.id_usuario,
          author: m.emisor_nombre,
          text: m.mensaje,
          attachmentUrl: m.adjunto_url,
          attachmentType: m.adjunto_tipo,
          attachmentName: m.adjunto_nombre,
          time: m.fecha_envio,
        }))}
        onSend={send}
        disabled={cerrado}
        disabledText="El servicio terminó; la conversación queda solo para consulta."
        emptyText={`Escríbele a ${otro}. Por seguridad, mantén la comunicación dentro de la app.`}
      />
    </Screen>
  );
}
