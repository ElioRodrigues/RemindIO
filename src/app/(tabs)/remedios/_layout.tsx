import { Stack } from 'expo-router';

export default function LayoutRemedios() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Remédios' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo remédio' }} />
    </Stack>
  );
}
