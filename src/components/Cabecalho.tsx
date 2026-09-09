import { StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';

export interface CabecalhoProps {
  titulo: string;
  subtitulo?: string;
}

export function Cabecalho(props: CabecalhoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{props.titulo}</Text>

      {/* O subtítulo é opcional, então só desenho quando a tela mandar um. */}
      {props.subtitulo ? (
        <Text style={styles.subtitulo}>{props.subtitulo}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: CORES.noite,
  },
  subtitulo: {
    fontSize: 14,
    color: CORES.roxo,
    marginTop: 4,
  },
});
