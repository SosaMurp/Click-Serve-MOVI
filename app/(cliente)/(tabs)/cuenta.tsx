import React from 'react';
import { ProfileScreen } from '@/src/features/account/ProfileScreen';

// Mi cuenta del cliente con el enfoque de CILIM: lo de uso diario en filas grandes y el resto
// (notificaciones, descargar o borrar mis datos, términos) en "Más opciones".
export default function Cuenta() {
  return (
    <ProfileScreen
      simple
      sections={[
        {
          title: 'Tu cuenta',
          items: [
            { icon: 'map-pin', title: 'Mis direcciones', subtitle: 'Casa, trabajo y otros domicilios', href: '/direcciones', tone: 'brand' },
            { icon: 'credit-card', title: 'Mis tarjetas', subtitle: 'Para pagar tus servicios', href: '/tarjetas', tone: 'accent' },
          ],
        },
      ]}
    />
  );
}
