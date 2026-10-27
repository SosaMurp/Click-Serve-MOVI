import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@/src/state/session';

// La app abre en el panel que corresponde si ya hay sesión (RF-02); si no, en el acceso.
export default function Index() {
  const { status, user } = useSession();
  if (status !== 'signedIn' || !user) return <Redirect href="/login" />;
  return <Redirect href={user.rol === 'tecnico' ? '/trabajos' : '/inicio'} />;
}
