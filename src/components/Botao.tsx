import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';

export interface BotaoProps {
  titulo: string;
  aoPressionar(): void;
  variante?: 'primario' | 'secundario';
  desabilitado?: boolean;
}

export function Botao(props: BotaoProps) {
  // Quando a variante não é informada, o botão é primário.
  const ehSecundario = props.variante === 'secundario';

  return (
    <Pressable onPress={props.aoPressionar} disabled={props.desabilitado}>
      <View
        style={[
          styles.caixa,
          ehSecundario ? styles.caixaSecundaria : styles.caixaPrimaria,
          // O botão desabilitado fica mais claro para o usuário perceber.
          props.desabilitado ? styles.desabilitado : null,
        ]}
      >
        <Text
          style={[
            styles.texto,
            ehSecundario ? styles.textoSecundario : styles.textoPrimario,
          ]}
        >
          {props.titulo}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  caixa: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  caixaPrimaria: {
    backgroundColor: CORES.menta,
  },
  caixaSecundaria: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CORES.noite,
  },
  desabilitado: {
    opacity: 0.5,
  },
  texto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoPrimario: {
    color: CORES.gelo,
  },
  textoSecundario: {
    color: CORES.noite,
  },
});
