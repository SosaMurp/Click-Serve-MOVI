import { api } from '../components/context/AuthContext';

export type RequestStatus = 'PENDIENTE' | 'ASIGNADA' | 'ESPERANDO_APROBACION' | 'EN_CAMINO' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';

export type ServiceRequest = {
  id_solicitud: number;
  folio: string;
  categoria?: string | null;
  descripcion: string;
  direccion: string;
  fecha_preferida?: string | null;
  hora_preferida?: string | null;
  estado: RequestStatus;
  fecha_creacion: string;
  id_tecnico?: number | null;
  calificacion?: number | null;
  comentario_calificacion?: string | null;
  calificacion_cliente?: number | null;
  comentario_cliente?: string | null;
  evidencia_foto?: string | null;
  monto_cotizacion?: number | null;
  detalles_cotizacion?: string | null;
  cliente_nombre?: string;
  cliente_apellido?: string;
  tecnico_nombre?: string;
  tecnico_apellido?: string;
  tecnico_telefono?: string;
  tecnico_foto?: string;
  tecnico_calificacion?: number;
  tecnico_trabajos?: number;
  tecnico_efectividad?: number;
  latitud?: number | null;
  longitud?: number | null;
  estado_pago?: string | null;
  tecnico_verificado_sep?: boolean | null;
};

export async function createServiceRequest(payload: {
  categoria?: string;
  descripcion: string;
  direccion: string;
  fecha_preferida?: string;
  hora_preferida?: string;
  latitud?: number;
  longitud?: number;
}): Promise<ServiceRequest> {
  const response = await api.post('/api/solicitudes', payload);
  return response.data.solicitud;
}

export async function getClientRequests(): Promise<ServiceRequest[]> {
  const response = await api.get('/api/solicitudes/cliente');
  return response.data.solicitudes || [];
}

export async function getTechnicianRequests(): Promise<ServiceRequest[]> {
  const response = await api.get('/api/solicitudes/tecnico');
  return response.data.solicitudes || [];
}

export async function updateRequestStatus(id: number, estado: 'ASIGNADA' | 'EN_CAMINO' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA'): Promise<ServiceRequest> {
  const response = await api.patch(`/api/solicitudes/${id}/estado`, { estado });
  return response.data.solicitud;
}

export async function finishServiceRequest(id: number, evidencia_foto?: string): Promise<ServiceRequest> {
  const response = await api.post(`/api/solicitudes/${id}/finalizar`, { evidencia_foto });
  return response.data.solicitud;
}

export async function sendCotizacion(id: number, monto: number, detalles: string): Promise<ServiceRequest> {
  const response = await api.post(`/api/solicitudes/${id}/cotizar`, {
    monto_cotizacion: monto,
    detalles_cotizacion: detalles,
  });
  return response.data.solicitud;
}

export async function respondCotizacion(id: number, respuesta: 'ACEPTAR' | 'RECHAZAR'): Promise<ServiceRequest> {
  const response = await api.patch(`/api/solicitudes/${id}/responder-cotizacion`, { respuesta });
  return response.data.solicitud;
}

export type ChatMessage = { id: number; id_solicitud: number; id_emisor: number; mensaje: string; fecha_envio: string };

export async function getChatMessages(id: number): Promise<ChatMessage[]> {
  const response = await api.get(`/api/solicitudes/${id}/chat`);
  return response.data.mensajes || [];
}

export async function sendChatMessage(id: number, mensaje: string): Promise<ChatMessage> {
  const response = await api.post(`/api/solicitudes/${id}/chat`, { mensaje });
  return response.data.mensaje;
}

export async function rateRequest(id: number, calificacion: number, comentario: string): Promise<void> {
  const idServicioInt = parseInt(String(id), 10);
  const calificacionInt = parseInt(String(calificacion), 10);
  await api.post(`/api/solicitudes/${idServicioInt}/calificar`, {
    id_servicio: idServicioInt,
    calificacion_cliente: calificacionInt,
    calificacion: calificacionInt,
    comentario_cliente: comentario,
    comentario: comentario,
  });
}

export async function sendSosAlert(id: number, latitud?: number, longitud?: number): Promise<ServiceRequest> {
  const response = await api.post(`/api/solicitudes/${id}/sos`, {
    latitud_sos: latitud,
    longitud_sos: longitud,
  });
  return response.data.solicitud;
}

export async function registerPushToken(pushToken: string): Promise<void> {
  await api.post('/api/usuario/push-token', { push_token: pushToken });
}

export async function checkoutPayment(id: number, monto: number): Promise<ServiceRequest> {
  const response = await api.post('/api/pagos/checkout', { id_solicitud: id, monto });
  return response.data.solicitud;
}

export async function validateSepCedula(cedula: string, nombreCompleto?: string): Promise<{ verificado_sep: boolean; mensaje?: string }> {
  const response = await api.post('/api/tecnicos/validar-cedula', { cedula, nombre_completo: nombreCompleto });
  return response.data;
}



