import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';
import { Dose, SituacaoDaDose } from '../types';
import { Botao } from './Botao';

export interface BolhaDoseProps {
  dose: Dose;
  situacao: SituacaoDaDose;
  // "a partir de 07:00": quando a dose aguardando pode ser confirmada.
  liberaAs: string;
  // A última dose do dia não tem a linha que liga à próxima bolha.
  ultima: boolean;
  aoConfirmar(): void;
  // Para quem tocou em "Tomei" por engano.
  aoDesfazer(): void;
}

// O que aparece embaixo do nome do remédio em cada situação.
function textoDaSituacao(situacao: SituacaoDaDose, liberaAs: string): string {
  if (situacao === 'tomada') {
    return 'Tomada';
  }
  if (situacao === 'atrasada') {
    return 'Atrasada';
  }
  if (situacao === 'liberada') {
    return 'É a hora desta dose';
  }
  return 'A partir de ' + liberaAs;
}

// Uma linha da cartela do dia: a bolha à esquerda (como a bolha de uma
// cartela de comprimidos), o horário e o remédio no meio, e o botão à direita.
export function BolhaDose(props: BolhaDoseProps) {
  // Animated.Value é um número que o React Native consegue animar sem
  // redesenhar a tela inteira. Começa em 1 (tamanho normal da bolha).
  // O useRef guarda o MESMO valor entre um render e outro: se fosse uma
  // variável comum, ele voltaria a 1 a cada render e a animação quebraria.
  const escala = useRef(new Animated.Value(1)).current;

  // Lembra a situação do render anterior, para saber se ela MUDOU para
  // "tomada" agora (animar) ou se já abriu a tela assim (não animar).
  const situacaoAnterior = useRef(props.situacao);

  useEffect(() => {
    const acabouDeSerTomada =
      situacaoAnterior.current !== 'tomada' && props.situacao === 'tomada';

    if (acabouDeSerTomada) {
      // A bolha encolhe e volta com um "quique": é a resposta ao toque no
      // "Tomei", mostrando qual dose mudou.
      escala.setValue(0.5);
      Animated.spring(escala, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }

    situacaoAnterior.current = props.situacao;
  }, [props.situacao]);

  const podeConfirmar =
    props.situacao === 'liberada' || props.situacao === 'atrasada';

  return (
    <View style={styles.linha}>
      <View style={styles.trilho}>
        <Animated.View
          style={[
            styles.bolha,
            ESTILO_DA_BOLHA[props.situacao],
            { transform: [{ scale: escala }] },
          ]}
        >
          {props.situacao === 'tomada' ? (
            <MaterialIcons name="check" size={18} color={CORES.branco} />
          ) : null}
        </Animated.View>

        {/* A linha que liga uma bolha à próxima, como a fileira da cartela. */}
        {props.ultima ? null : <View style={styles.ligacao} />}
      </View>

      <View style={styles.conteudo}>
        <Text
          style={[
            styles.horario,
            props.situacao === 'tomada' ? styles.horarioTomado : null,
          ]}
        >
          {props.dose.horario}
        </Text>
        <Text style={styles.remedio}>
          {props.dose.remedio.nome}
          <Text style={styles.dosagem}> {props.dose.remedio.dosagem}</Text>
        </Text>
        <Text style={[styles.situacao, COR_DO_TEXTO[props.situacao]]}>
          {textoDaSituacao(props.situacao, props.liberaAs)}
        </Text>
      </View>

      {podeConfirmar ? (
        <View style={styles.acao}>
          <Botao titulo="Tomei" compacto aoPressionar={props.aoConfirmar} />
        </View>
      ) : null}

      {/* Na dose já tomada, um "Desfazer" discreto, só texto: ele existe
          para corrigir um engano, e não deve competir com o "Tomei" das
          outras doses. */}
      {props.situacao === 'tomada' ? (
        <Pressable
          style={({ pressed }) => [
            styles.acao,
            styles.desfazer,
            pressed ? styles.desfazerPressionado : null,
          ]}
          onPress={props.aoDesfazer}
        >
          <Text style={styles.textoDesfazer}>Desfazer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const TAMANHO_DA_BOLHA = 30;

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
  },
  trilho: {
    width: TAMANHO_DA_BOLHA,
    alignItems: 'center',
    marginRight: 14,
  },
  bolha: {
    width: TAMANHO_DA_BOLHA,
    height: TAMANHO_DA_BOLHA,
    borderRadius: TAMANHO_DA_BOLHA / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  ligacao: {
    // flex: 1 estica a linha até o fim da altura da dose, encostando na
    // bolha da dose seguinte.
    flex: 1,
    width: 2,
    backgroundColor: CORES.lavandaClara,
    marginVertical: 4,
  },
  conteudo: {
    flex: 1,
    paddingBottom: 22,
  },
  horario: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    lineHeight: 28,
    color: CORES.ameixa,
  },
  horarioTomado: {
    color: CORES.ameixaSuave,
  },
  remedio: {
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixa,
  },
  dosagem: {
    fontFamily: FONTES.texto,
    color: CORES.ameixaSuave,
  },
  situacao: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    marginTop: 2,
  },
  acao: {
    justifyContent: 'center',
    paddingBottom: 22,
    marginLeft: 8,
  },
  desfazer: {
    // Área de toque de pelo menos 44 de altura, mesmo sendo só um texto.
    minHeight: 44,
    paddingHorizontal: 12,
    paddingBottom: 0,
    alignSelf: 'center',
    marginBottom: 22,
    borderRadius: 999,
  },
  desfazerPressionado: {
    backgroundColor: CORES.lavandaClara,
  },
  textoDesfazer: {
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
    textDecorationLine: 'underline',
  },
});

// Um estilo de bolha para cada situação. A situação nunca é mostrada só
// pela cor: a bolha também muda de forma (cheia, com anel, tracejada, vazia)
// e o texto embaixo do remédio diz o que é.
const ESTILO_DA_BOLHA = StyleSheet.create({
  tomada: {
    backgroundColor: CORES.salvia,
  },
  liberada: {
    backgroundColor: CORES.ambarClaro,
    borderWidth: 4,
    borderColor: CORES.ambar,
  },
  atrasada: {
    backgroundColor: CORES.framboesaClara,
    borderWidth: 2,
    borderColor: CORES.framboesa,
    borderStyle: 'dashed',
  },
  aguardando: {
    backgroundColor: CORES.nevoa,
    borderWidth: 2,
    borderColor: CORES.lavanda,
  },
});

const COR_DO_TEXTO = StyleSheet.create({
  tomada: { color: CORES.salvia },
  liberada: { color: CORES.ambar, fontFamily: FONTES.textoForte },
  atrasada: { color: CORES.framboesa, fontFamily: FONTES.textoForte },
  aguardando: { color: CORES.ameixaSuave },
});
