import { api } from '../components/context/AuthContext';

export interface Billetera {
  id_billetera: number;
  id_usuario: number;
  saldo_actual: string | number;
  clabe_interbancaria: string | null;
  fecha_actualizacion?: string;
}

export const getBilletera = async (): Promise<Billetera> => {
  const response = await api.get('/api/billetera');
  return response.data;
};

export const updateClabe = async (clabe_interbancaria: string): Promise<{ mensaje: string; billetera: Billetera }> => {
  const response = await api.put('/api/billetera/clabe', { clabe_interbancaria });
  return response.data;
};

export const solicitarRetiro = async (monto: number): Promise<{ mensaje: string; transaccion: any }> => {
  const response = await api.post('/api/billetera/retiro', { monto });
  return response.data;
};

