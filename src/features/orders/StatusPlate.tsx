import React from 'react';
import { Pill } from '../../design/Plate';
import type { IconName } from '../../design/Icon';
import type { Estado } from '../../api/types';
import { estadoInfo } from '../../lib/estado';

// Píldora de estado de una orden: mismo significado de color en toda la app (RNF-31).
export function StatusPill({ estado, rol, size = 'sm' }: { estado: Estado; rol: 'cliente' | 'tecnico'; size?: 'sm' | 'md' | 'lg' }) {
  const info = estadoInfo(estado, rol);
  return <Pill label={info.label} tone={info.tone} size={size} icon={size === 'sm' ? undefined : (info.icon as IconName)} accessibilityLabel={`Estado: ${info.label}`} />;
}

export const StatusPlate = StatusPill;
