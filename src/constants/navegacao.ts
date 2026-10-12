import { CORES } from './cores';
import { FONTES } from './fontes';

// Estilo dos cabeçalhos, igual em todas as pilhas do app (a raiz e a de
// remédios) e nas abas. Fica num lugar só para não copiar em cada _layout.
export const CABECALHO_DO_APP = {
  headerStyle: { backgroundColor: CORES.nevoa },
  headerTintColor: CORES.ameixa,
  headerTitleStyle: { fontFamily: FONTES.titulo, fontSize: 22 },
  // Tira a linha e a sombra embaixo do cabeçalho: o fundo é o mesmo da
  // tela, então o cabeçalho parece parte dela.
  headerShadowVisible: false,
};
