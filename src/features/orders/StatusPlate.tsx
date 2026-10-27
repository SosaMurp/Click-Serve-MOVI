import React from 'react';
import { Plate } from '../../design/Plate';
import type { IconName } from '../../design/Icon';
import type { Estado } from '../../api/types';
import { estadoInfo } from '../../lib/estado';

// La placa de estado de una orden: el rótulo que se lee desde lejos.
export function StatusPlate({ estado, rol, size = 'sm' }: { estado: Estado; rol: 'cliente' | 'tecnico'; size?: 'sm' | 'md' | 'lg' }) {
  const info = estadoInfo(estado, rol);
  return <Plate label={info.label} tone={info.tone} size={size} icon={size === 'sm' ? undefined : (info.icon as IconName)} accessibilityLabel={`Estado: ${info.label}`} />;
}
