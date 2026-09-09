import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { CORES } from '../../constants/cores';

export default function LayoutTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: CORES.menta,
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
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
