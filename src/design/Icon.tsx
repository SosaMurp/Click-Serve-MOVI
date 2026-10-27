import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Un solo sistema de íconos en toda la app (Material Community Icons, trazo uniforme).
export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = { name: IconName; size?: number; color?: string };

export function Icon({ name, size = 22, color = '#16181D' }: Props) {
  return <MaterialCommunityIcons name={name} size={size} color={color} accessibilityElementsHidden importantForAccessibility="no" />;
}

export const iconFont = MaterialCommunityIcons.font;
