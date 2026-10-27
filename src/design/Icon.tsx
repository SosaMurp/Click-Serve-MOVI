import React from 'react';
import { Feather } from '@expo/vector-icons';

// Íconos de contorno de un solo grosor (Feather) en toda la app.
export type IconName = React.ComponentProps<typeof Feather>['name'];

type Props = { name: IconName; size?: number; color?: string };

export function Icon({ name, size = 22, color = '#141A23' }: Props) {
  return <Feather name={name} size={size} color={color} accessibilityElementsHidden importantForAccessibility="no" />;
}

export const iconFont = Feather.font;
