// Os nomes aqui são os mesmos usados no useFonts do src/app/_layout.tsx.
// No React Native cada peso de uma fonte é um arquivo diferente, então o
// negrito não é fontWeight: 'bold', e sim outra fontFamily.
export const FONTES = {
  // Baloo 2: arredondada e "gordinha", com o volume de massinha do urso.
  // Usada em títulos, no nome do pet e nos horários grandes.
  tituloMedio: 'Baloo2_600SemiBold',
  titulo: 'Baloo2_700Bold',
  tituloForte: 'Baloo2_800ExtraBold',
  // Atkinson Hyperlegible: feita para leitores com baixa visão. Diferencia
  // 0 de O e 1 de l, o que importa quando se lê "500 mg" ou "10:00".
  texto: 'AtkinsonHyperlegible_400Regular',
  textoForte: 'AtkinsonHyperlegible_700Bold',
};

// Escala de tamanhos. Poucos tamanhos, sempre os mesmos, para a hierarquia
// ficar clara: quem é título, quem é texto, quem é detalhe.
export const TAMANHOS = {
  detalhe: 13,
  texto: 16,
  destaque: 20,
  titulo: 26,
  tituloGrande: 34,
};
