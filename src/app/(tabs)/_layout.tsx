import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { CORES } from '../../constants/cores';
import { FONTES } from '../../constants/fontes';
import { CABECALHO_DO_APP } from '../../constants/navegacao';

export default function LayoutTabs() {
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
