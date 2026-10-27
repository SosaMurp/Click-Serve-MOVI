import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { tecnicoApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { currentLocation, hapticSuccess, quietLocation } from '../lib/media';
import { toast } from '../ui/toast';
import { useSession } from './session';

// RF-21 + RNF-34: interruptor ONLINE del técnico y latido cada 20 s mientras está en línea.
type Value = { disponible: boolean; cambiando: boolean; setDisponible: (v: boolean) => Promise<void> };
const AvailabilityContext = createContext<Value>({ disponible: false, cambiando: false, setDisponible: async () => {} });
export const useAvailability = () => useContext(AvailabilityContext);

export function AvailabilityProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useSession();
  const [disponible, setDisp] = useState(!!user?.disponible);
  const [cambiando, setCambiando] = useState(false);

  useEffect(() => { setDisp(!!user?.disponible); }, [user?.disponible]);

  useEffect(() => {
    if (!disponible) return undefined;
    const beat = async () => {
      const pos = await quietLocation();
      try {
        const res = await tecnicoApi.latido(pos?.latitude, pos?.longitude);
        if (!res.disponible) setDisp(false);
      } catch { /* sin red: el aviso de conexión ya lo informa */ }
    };
    beat();
    const timer = setInterval(beat, 20000);
    return () => clearInterval(timer);
  }, [disponible]);

  const setDisponible = useCallback(async (v: boolean) => {
    setCambiando(true);
    try {
      const pos = v ? await currentLocation() : null;
      const res = await tecnicoApi.disponibilidad(v, pos?.latitude, pos?.longitude);
      setDisp(res.disponible);
      if (user) setUser({ ...user, disponible: res.disponible });
      hapticSuccess();
      toast.show(res.disponible && !pos ? 'Estás en línea. Activa tu ubicación para recibir trabajos cercanos.' : res.mensaje);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setCambiando(false);
    }
  }, [user, setUser]);

  return <AvailabilityContext.Provider value={{ disponible, cambiando, setDisponible }}>{children}</AvailabilityContext.Provider>;
}

// RNF-43: mientras va en camino, el técnico comparte su ubicación cada 4 s.
export function useLocationBroadcast(active: boolean) {
  useEffect(() => {
    if (!active) return undefined;
    let busy = false;
    const send = async () => {
      if (busy) return;
      busy = true;
      try {
        const pos = await quietLocation();
        if (pos) await tecnicoApi.ubicacion(pos.latitude, pos.longitude);
      } catch { /* reintenta en el siguiente ciclo */ } finally {
        busy = false;
      }
    };
    send();
    const timer = setInterval(send, 4000);
    return () => clearInterval(timer);
  }, [active]);
}
