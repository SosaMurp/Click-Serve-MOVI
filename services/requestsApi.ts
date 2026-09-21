import { api } from '../components/context/AuthContext';

export type RequestStatus = 'PENDIENTE' | 'ASIGNADA' | 'EN_CAMINO' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';

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
  cliente_nombre?: string;
  cliente_apellido?: string;
};

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
  await api.post(`/api/solicitudes/${id}/calificar`, { calificacion, comentario });
}
