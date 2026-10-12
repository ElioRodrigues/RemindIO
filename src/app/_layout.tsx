import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View } from 'react-native';
import { CORES } from '../constants/cores';
import { CABECALHO_DO_APP } from '../constants/navegacao';

// O expo-notifications avisa, ao ser carregado no Expo Go, que as
// notificações REMOTAS (push, enviadas por um servidor) não funcionam lá.
// O RemindIO só usa notificações LOCAIS, agendadas no próprio aparelho, que
// funcionam normalmente. O aviso não se aplica, então é escondido da tela.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

export default function LayoutRaiz() {
  // useFonts carrega os arquivos das fontes e devolve true quando terminou.
  // As chaves do objeto viram os nomes usados em fontFamily (ver fontes.ts).
  const [fontesCarregadas] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });

  // Enquanto as fontes não chegam, uma tela lisa da cor do fundo. Sem isso
  // os textos apareceriam um instante na fonte padrão e depois "pulariam".
  if (!fontesCarregadas) {
    return <View style={{ flex: 1, backgroundColor: CORES.nevoa }} />;
  }

  return (
    <>
      {/* Ícones da barra de status escuros, porque o fundo é claro. */}
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          ...CABECALHO_DO_APP,
          contentStyle: { backgroundColor: CORES.nevoa },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
