import { Pressable, StyleSheet, Text } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';

export interface BotaoProps {
  titulo: string;
  aoPressionar(): void;
  variante?: 'primario' | 'secundario';
  desabilitado?: boolean;
  // Versão menor, para caber ao lado de um texto (o "Tomei" da cartela).
  compacto?: boolean;
}

export function Botao(props: BotaoProps) {
  // Quando a variante não é informada, o botão é primário.
  const ehSecundario = props.variante === 'secundario';

  return (
    <Pressable
      onPress={props.aoPressionar}
      disabled={props.desabilitado}
      // O style do Pressable pode ser uma função: ele avisa se o dedo está
      // em cima (pressed), e o botão escurece um pouco enquanto isso. É o
      // retorno visual de que o toque foi percebido.
      style={({ pressed }) => [
        styles.caixa,
        ehSecundario ? styles.caixaSecundaria : styles.caixaPrimaria,
        props.compacto ? styles.caixaCompacta : null,
        pressed ? styles.pressionado : null,
        props.desabilitado ? styles.desabilitado : null,
      ]}
    >
      <Text
        style={[
          styles.texto,
          ehSecundario ? styles.textoSecundario : styles.textoPrimario,
          props.compacto ? styles.textoCompacto : null,
        ]}
      >
        {props.titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  caixa: {
    // Raio maior que a metade da altura vira uma cápsula, como um comprimido.
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  caixaPrimaria: {
    backgroundColor: CORES.salvia,
  },
  caixaSecundaria: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: CORES.ameixa,
  },
  caixaCompacta: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  pressionado: {
    opacity: 0.75,
  },
  desabilitado: {
    opacity: 0.4,
  },
  texto: {
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.texto,
  },
  textoPrimario: {
    color: CORES.branco,
  },
  textoSecundario: {
    color: CORES.ameixa,
  },
  textoCompacto: {
    fontSize: 15,
  },
});
