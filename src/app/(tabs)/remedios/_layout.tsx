import { Stack } from 'expo-router';
import { CORES } from '../../../constants/cores';
import { CABECALHO_DO_APP } from '../../../constants/navegacao';

export default function LayoutRemedios() {
  return (
    <Stack
      screenOptions={{
        ...CABECALHO_DO_APP,
        contentStyle: { backgroundColor: CORES.nevoa },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Remédios' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo remédio' }} />
    </Stack>
  );
}
