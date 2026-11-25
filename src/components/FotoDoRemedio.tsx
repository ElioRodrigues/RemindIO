import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { CORES } from '../constants/cores';
import { enderecoDaFoto } from '../services/fotos';

export interface FotoDoRemedioProps {
  // A foto do remédio: um arquivo do aparelho (logo depois de tirar) ou o
  // caminho dela no Storage. Vazio ou ausente mostra o ícone no lugar.
  foto?: string;
  // Largura e altura do quadrado: 56 no card, 96 no detalhe e no formulário.
  tamanho: number;
}

// O quadrado da foto do remédio. O mesmo componente serve para o card da
// lista, o detalhe e o formulário, então a foto tem a mesma cara nos três.
export function FotoDoRemedio(props: FotoDoRemedioProps) {
  // O endereço que o Image abre. Começa vazio e é preenchido quando o link
  // assinado chega do Supabase (ver enderecoDaFoto em fotos.ts).
  const [endereco, setEndereco] = useState('');

  // Roda de novo sempre que a foto muda (por exemplo, ao trocar a foto no
  // formulário). A variável "ativo" evita um erro clássico: se a foto mudar
  // antes da resposta chegar, a resposta velha não sobrescreve a nova.
  useEffect(() => {
    let ativo = true;

    async function buscarEndereco() {
      if (!props.foto) {
        setEndereco('');
        return;
      }

      try {
        const novo = await enderecoDaFoto(props.foto);
        if (ativo) {
          setEndereco(novo);
        }
      } catch (erro) {
        // Sem internet a foto não carrega, e o ícone fica no lugar. Não
        // vale uma janela de erro: o resto da tela funciona.
        console.log('Erro ao carregar foto', erro);
      }
    }

    buscarEndereco();

    // A função devolvida roda quando a foto muda ou a tela sai.
    return () => {
      ativo = false;
    };
  }, [props.foto]);

  // O canto acompanha o tamanho: um raio fixo deixaria o quadrado pequeno
  // quase redondo e o grande quase reto.
  const formato = {
    width: props.tamanho,
    height: props.tamanho,
    borderRadius: props.tamanho / 4,
  };

  if (endereco !== '') {
    // source com uri abre tanto um arquivo do aparelho quanto um link.
    // resizeMode cover preenche o quadrado todo, cortando as sobras.
    return (
      <Image
        source={{ uri: endereco }}
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
