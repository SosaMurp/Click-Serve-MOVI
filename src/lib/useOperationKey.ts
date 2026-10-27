import { useRef } from 'react';
import { newOperationKey } from '../api/client';

// RNF-32/33: una misma acción reutiliza su clave de idempotencia hasta que el servidor responde con éxito,
// así un doble toque o un reintento por red lenta no la ejecuta dos veces.
export function useOperationKey() {
  const ref = useRef<string | null>(null);
  return {
    get: () => {
      if (!ref.current) ref.current = newOperationKey();
      return ref.current;
    },
    reset: () => { ref.current = null; },
  };
}
