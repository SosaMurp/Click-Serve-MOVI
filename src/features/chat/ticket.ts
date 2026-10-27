import type { Ticket } from '../../api/types';

// Estado visible de un caso de soporte (píldora con texto, nunca solo color).
export function ticketTone(t: Ticket): { label: string; tone: 'danger' | 'neutral' | 'brand' | 'success' } {
  if (t.estado === 'ESCALADO') return { label: 'Urgente', tone: 'danger' };
  if (t.estado === 'CERRADO' || t.estado === 'RESUELTO') return { label: 'Cerrado', tone: 'success' };
  return { label: 'Abierto', tone: 'brand' };
}
