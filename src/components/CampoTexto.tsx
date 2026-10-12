import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';

export interface CampoTextoProps {
  rotulo: string;
  valor: string;
  aoMudarTexto(texto: string): void;
  // Avisa a tela que o usuário saiu do campo, para ela marcar como "tocado".
  aoSair?(): void;
  erro?: string;
  // Uma frase de ajuda embaixo do campo, que some quando aparece um erro.
  dica?: string;
  segredo?: boolean;
  tipoTeclado?: 'default' | 'email-address' | 'numeric';
  placeholder?: string;
  // Nomes e frases começam com maiúscula; e-mail e senha não.
  capitalizar?: 'none' | 'sentences' | 'words';
}

export function CampoTexto(props: CampoTextoProps) {
  // Guarda se o campo está com o cursor, só para mudar a cor da borda.
  // É estado da aparência do campo, por isso fica aqui e não na tela.
  const [focado, setFocado] = useState(false);

  function aoSairDoCampo() {
    setFocado(false);
    // O ? antes do () só chama a função se a tela tiver mandado uma.
    props.aoSair?.();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{props.rotulo}</Text>

      <TextInput
        style={[
          styles.campo,
          focado ? styles.campoFocado : null,
          // O erro vem por último para vencer: a borda de erro tem prioridade.
          props.erro ? styles.campoComErro : null,
        ]}
        value={props.valor}
        onChangeText={props.aoMudarTexto}
        onFocus={() => setFocado(true)}
        onBlur={aoSairDoCampo}
        secureTextEntry={props.segredo}
        keyboardType={props.tipoTeclado}
        placeholder={props.placeholder}
        // O placeholder é só um exemplo (o rótulo acima diz o que é o campo),
        // então fica mais claro, para não parecer um valor já digitado.
        placeholderTextColor={CORES.lavanda}
        autoCapitalize={props.capitalizar ?? 'none'}
      />

      {/* Ou o erro, ou a dica: os dois juntos disputariam a atenção. */}
      {props.erro ? (
        <Text style={styles.erro}>{props.erro}</Text>
      ) : props.dica ? (
        <Text style={styles.dica}>{props.dica}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  rotulo: {
    fontFamily: FONTES.textoForte,
    fontSize: 15,
    color: CORES.ameixa,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1.5,
    borderColor: CORES.lavandaClara,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixa,
    backgroundColor: CORES.branco,
  },
  campoFocado: {
    borderColor: CORES.lavanda,
  },
  campoComErro: {
    borderColor: CORES.framboesa,
  },
  erro: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.framboesa,
    marginTop: 6,
  },
  dica: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
    marginTop: 6,
  },
});
