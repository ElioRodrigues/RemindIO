import { Pressable, StyleSheet, Text } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';

export interface BotaoProps {
  titulo: string;
  aoPressionar(): void;
  // perigo é para ações que apagam algo, como excluir um remédio.
  variante?: 'primario' | 'secundario' | 'perigo';
  desabilitado?: boolean;
  // Versão menor, para caber ao lado de um texto (o "Tomei" da cartela).
  compacto?: boolean;
}

export function Botao(props: BotaoProps) {
  // Quando a variante não é informada, o botão é primário.
  const ehSecundario = props.variante === 'secundario';
  const ehPerigo = props.variante === 'perigo';

  // Escolhe a caixa e o texto de cada variante. Um if por variante é mais
  // fácil de ler que um ternário dentro do outro.
  let estiloDaCaixa = styles.caixaPrimaria;
  let estiloDoTexto = styles.textoPrimario;
  if (ehSecundario) {
    estiloDaCaixa = styles.caixaSecundaria;
    estiloDoTexto = styles.textoSecundario;
  }
  if (ehPerigo) {
    estiloDaCaixa = styles.caixaPerigo;
    estiloDoTexto = styles.textoPerigo;
  }

  return (
    <Pressable
      onPress={props.aoPressionar}
      disabled={props.desabilitado}
      // O style do Pressable pode ser uma função: ele avisa se o dedo está
      // em cima (pressed), e o botão escurece um pouco enquanto isso. É o
      // retorno visual de que o toque foi percebido.
      style={({ pressed }) => [
        styles.caixa,
        estiloDaCaixa,
        props.compacto ? styles.caixaCompacta : null,
        pressed ? styles.pressionado : null,
        props.desabilitado ? styles.desabilitado : null,
      ]}
    >
      <Text
        style={[
          styles.texto,
          estiloDoTexto,
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
  // Só o contorno em framboesa: chama a atenção sem competir com a ação
  // principal da tela.
  caixaPerigo: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: CORES.framboesa,
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
  textoPerigo: {
    color: CORES.framboesa,
  },
  textoCompacto: {
    fontSize: 15,
  },
});
