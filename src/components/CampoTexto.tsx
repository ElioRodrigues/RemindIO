import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CORES } from '../constants/cores';

export interface CampoTextoProps {
  rotulo: string;
  valor: string;
  aoMudarTexto(texto: string): void;
  // Avisa a tela que o usuário saiu do campo, para ela marcar como "tocado".
  aoSair?(): void;
  erro?: string;
  segredo?: boolean;
  tipoTeclado?: 'default' | 'email-address' | 'numeric';
  placeholder?: string;
}

export function CampoTexto(props: CampoTextoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{props.rotulo}</Text>

      <TextInput
        style={[styles.campo, props.erro ? styles.campoComErro : null]}
        value={props.valor}
        onChangeText={props.aoMudarTexto}
        onBlur={props.aoSair}
        secureTextEntry={props.segredo}
        keyboardType={props.tipoTeclado}
        placeholder={props.placeholder}
        placeholderTextColor={CORES.roxo}
        autoCapitalize="none"
      />

      {/* A mensagem só aparece quando a tela mandou um erro preenchido. */}
      {props.erro ? <Text style={styles.erro}>{props.erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  rotulo: {
    fontSize: 14,
    color: CORES.noite,
    marginBottom: 4,
  },
  campo: {
    borderWidth: 1,
    borderColor: CORES.roxo,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: CORES.noite,
    backgroundColor: CORES.gelo,
  },
  campoComErro: {
    borderColor: CORES.coral,
  },
  erro: {
    color: CORES.coral,
    fontSize: 12,
    marginTop: 4,
  },
});
