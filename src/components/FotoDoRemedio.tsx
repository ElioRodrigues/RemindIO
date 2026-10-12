import { MaterialIcons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { CORES } from '../constants/cores';

export interface FotoDoRemedioProps {
  // Endereço da foto. Vazio ou ausente mostra o ícone de remédio no lugar.
  foto?: string;
  // Largura e altura do quadrado: 56 no card, 96 no detalhe e no formulário.
  tamanho: number;
}

// O quadrado da foto do remédio. O mesmo componente serve para o card da
// lista, o detalhe e o formulário, então a foto tem a mesma cara nos três.
export function FotoDoRemedio(props: FotoDoRemedioProps) {
  // O canto acompanha o tamanho: um raio fixo deixaria o quadrado pequeno
  // quase redondo e o grande quase reto.
  const formato = {
    width: props.tamanho,
    height: props.tamanho,
    borderRadius: props.tamanho / 4,
  };

  if (props.foto) {
    // source com uri é como o Image mostra um arquivo do aparelho.
    // resizeMode cover preenche o quadrado todo, cortando as sobras.
    return (
      <Image
        source={{ uri: props.foto }}
        style={[styles.foto, formato]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.semFoto, formato]}>
      <MaterialIcons
        name="medication"
        // O ícone ocupa metade do quadrado, em qualquer tamanho.
        size={props.tamanho / 2}
        color={CORES.lavanda}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  foto: {
    backgroundColor: CORES.lavandaClara,
  },
  semFoto: {
    backgroundColor: CORES.lavandaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
