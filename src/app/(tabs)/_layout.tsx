import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { CORES } from '../../constants/cores';
import { FONTES } from '../../constants/fontes';
import { CABECALHO_DO_APP } from '../../constants/navegacao';
import {
  atualizarLembretes,
  configurarNotificacoes,
} from '../../services/lembretes';

// As mesmas cores do tabBarActiveTintColor e do tabBarInactiveTintColor.
// No SDK 58 a cor que a aba entrega ao ícone pode ser null no tipo, e o
// MaterialIcons não aceita null; com as constantes, o tipo é sempre string.
function corDoIcone(ativa: boolean): string {
  return ativa ? CORES.ameixa : CORES.ameixaSuave;
}

export default function LayoutTabs() {
  // Este layout só aparece com alguém logado (depois do login, ou quando o
  // app abre e lembra a sessão). Por isso é aqui que os lembretes da conta
  // são preparados, uma vez por abertura do app.
  useEffect(() => {
    async function prepararLembretes() {
      await configurarNotificacoes();
      // Também pede a permissão na primeira vez.
      await atualizarLembretes();
    }

    prepararLembretes();

    // Tocar num lembrete abre o app na tela Hoje, onde está o "Tomei".
    // O addListener devolve uma "inscrição"; o remove() no retorno do
    // useEffect desliga o ouvinte quando o layout sai da tela (ao sair da
    // conta), senão ele continuaria ouvindo sem ninguém logado.
    const inscricao = Notifications.addNotificationResponseReceivedListener(
      () => {
        router.navigate('/inicio');
      }
    );

    return () => inscricao.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        ...CABECALHO_DO_APP,
        // A aba ativa fica na cor do texto e a inativa no tom suave. Uma cor
        // de destaque aqui competiria com as cores dos estados das doses.
        tabBarActiveTintColor: CORES.ameixa,
        tabBarInactiveTintColor: CORES.ameixaSuave,
        tabBarLabelStyle: { fontFamily: FONTES.textoForte, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: CORES.nevoa,
          borderTopColor: CORES.lavandaClara,
        },
        sceneStyle: { backgroundColor: CORES.nevoa },
        // No SDK 58 a barra de abas subia junto com o teclado e roubava
        // espaço do formulário. Escondida, o campo focado fica à vista.
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Hoje',
          // O Início tem a saudação dele, então dispensa o cabeçalho.
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <MaterialIcons name="today" color={corDoIcone(focused)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="remedios"
        options={{
          title: 'Remédios',
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <MaterialIcons name="medication" color={corDoIcone(focused)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused, size }) => (
            <MaterialIcons name="insights" color={corDoIcone(focused)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused, size }) => (
            <MaterialIcons name="settings" color={corDoIcone(focused)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
