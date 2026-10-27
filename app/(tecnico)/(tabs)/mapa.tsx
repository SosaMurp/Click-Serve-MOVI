import React from 'react';
import { AppBar, Screen, Text } from '@/src/design';

export default function Placeholder() {
  return (
    <Screen inTabs header={<AppBar title="mapa" back={false} />}>
      <Text>En construcción</Text>
    </Screen>
  );
}
