import React from 'react';
import { AppBar, Screen, Text } from '@/src/design';

export default function Placeholder() {
  return (
    <Screen inTabs header={<AppBar title="trabajos" back={false} />}>
      <Text>En construcción</Text>
    </Screen>
  );
}
