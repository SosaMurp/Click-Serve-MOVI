import { errorMessage } from '../../api/client';
import { solicitudesApi } from '../../api/endpoints';
import { dialog } from '../../ui/dialog';
import { toast } from '../../ui/toast';

// RF-51/RF-64: cancelar pide confirmación; el técnico debe dar un motivo, el cliente puede omitirlo.
export async function cancelOrder(id: number | string, rol: 'cliente' | 'tecnico'): Promise<boolean> {
  const motivo = await dialog.prompt({
    title: rol === 'cliente' ? '¿Cancelar la solicitud?' : '¿Dejar este servicio?',
    message: rol === 'cliente'
      ? 'Antes de que empiece el trabajo no hay cargo. Si quieres, dinos por qué (opcional).'
      : 'La solicitud vuelve a quedar disponible para otros técnicos. Escribe el motivo para el cliente.',
    placeholder: rol === 'cliente' ? 'Ya no lo necesito, encontré otra opción…' : 'Se me complicó el horario…',
    confirmText: rol === 'cliente' ? 'Cancelar solicitud' : 'Dejar servicio',
  });
  if (motivo === null) return false;
  if (rol === 'tecnico' && motivo.trim().length < 3) {
    toast.warning('Escribe el motivo de la cancelación.');
    return false;
  }
  try {
    const res = await solicitudesApi.cancelar(id, motivo.trim());
    toast.show(res.mensaje || 'Solicitud cancelada.');
    return true;
  } catch (e) {
    toast.error(errorMessage(e));
    return false;
  }
}
