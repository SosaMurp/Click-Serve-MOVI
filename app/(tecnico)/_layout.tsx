import { Stack } from 'expo-router';
import { color } from '@/src/design';
import { AvailabilityProvider } from '@/src/state/availability';

export default function TecnicoLayout() {
  return (
    <AvailabilityProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.ground } }} />
    </AvailabilityProvider>
  );
}
