import { Stack } from 'expo-router';
import { CORES } from '../../../constants/cores';
import { CABECALHO_DO_APP } from '../../../constants/navegacao';

// A lista (index) é a primeira tela desta pilha. Sem isso, abrir
// "Novo remédio" direto da tela Hoje criava uma pilha só com o formulário:
// ao salvar, o back voltava para Hoje e o formulário ficava preso na aba
// Remédios, ainda preenchido e sem seta de voltar.
// Atenção: o Expo Router só usa este initialRouteName quando a navegação
// pede, com router.push(..., { withAnchor: true }) (ver a tela Hoje).
export const unstable_settings = {
  initialRouteName: 'index',
};

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
      {/* Os nomes com [id] são as rotas dinâmicas: uma tela só serve para
          qualquer remédio, e o id vem no caminho. */}
      <Stack.Screen name="[id]" options={{ title: 'Remédio' }} />
      <Stack.Screen name="editar/[id]" options={{ title: 'Editar remédio' }} />
    </Stack>
  );
}
