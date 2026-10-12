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
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Hoje',
          // O Início tem a saudação dele, então dispensa o cabeçalho.
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="today" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="remedios"
        options={{
          title: 'Remédios',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medication" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
