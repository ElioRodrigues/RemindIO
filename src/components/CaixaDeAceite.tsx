import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';

export interface CaixaDeAceiteProps {
  marcada: boolean;
  aoAlternar(): void;
  // Abre o texto completo do termo.
  aoAbrirTermo(): void;
  erro?: string;
}

// A caixinha "Li e aceito o termo de privacidade" do cadastro (LGPD).
// O React Native não tem checkbox pronto: é um Pressable com dois ícones,
// a caixa vazia e a caixa marcada, trocados conforme o estado.
export function CaixaDeAceite(props: CaixaDeAceiteProps) {
  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        {/* accessibilityRole e accessibilityState fazem o leitor de tela
            anunciar "caixa de seleção, marcada", como num checkbox de verdade. */}
        <Pressable
          onPress={props.aoAlternar}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: props.marcada }}
          hitSlop={8}
        >
          <MaterialIcons
            name={props.marcada ? 'check-box' : 'check-box-outline-blank'}
            size={28}
            color={props.erro ? CORES.framboesa : CORES.salvia}
          />
        </Pressable>

        <Text style={styles.texto}>
          Li e aceito o{' '}
          {/* Um Text dentro de outro continua na mesma linha e pode ter
              o próprio onPress: é o jeito de fazer um "link" no meio da frase. */}
          <Text style={styles.link} onPress={props.aoAbrirTermo}>
            termo de privacidade
          </Text>
          , que explica onde meus dados ficam guardados.
        </Text>
      </View>

      {props.erro ? <Text style={styles.erro}>{props.erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  texto: {
    // flex: 1 faz o texto ocupar o resto da linha e quebrar em várias.
    flex: 1,
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixa,
    lineHeight: 24,
  },
  link: {
    fontFamily: FONTES.textoForte,
    color: CORES.salvia,
    textDecorationLine: 'underline',
  },
  erro: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.framboesa,
    marginTop: 4,
    marginLeft: 38,
  },
});
