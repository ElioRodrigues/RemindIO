import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';
import { escolherFoto, OrigemDaFoto } from '../services/fotos';
import { FotoDoRemedio } from './FotoDoRemedio';

export interface CampoFotoProps {
  // Endereço da foto atual ('' quando não tem).
  foto: string;
  aoMudarFoto(novaFoto: string): void;
}

// O campo de foto do formulário de remédio: a prévia à esquerda e as
// ações à direita (câmera, galeria e remover).
export function CampoFoto(props: CampoFotoProps) {
  async function trocarFoto(origem: OrigemDaFoto) {
    const novaFoto = await escolherFoto(origem);

    // null é "desistiu" ou "negou a permissão": a foto antiga continua.
    if (novaFoto !== null) {
      props.aoMudarFoto(novaFoto);
    }
  }

  const temFoto = props.foto !== '';

  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>Foto da caixa ou da receita</Text>

      <View style={styles.linha}>
        <FotoDoRemedio foto={props.foto} tamanho={96} />

        <View style={styles.acoes}>
          <Pressable
            style={({ pressed }) => [styles.acao, pressed ? styles.pressionado : null]}
            onPress={() => trocarFoto('camera')}
          >
            <MaterialIcons name="photo-camera" size={20} color={CORES.ameixa} />
            <Text style={styles.textoDaAcao}>
              {temFoto ? 'Tirar outra' : 'Tirar foto'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.acao, pressed ? styles.pressionado : null]}
            onPress={() => trocarFoto('galeria')}
          >
            <MaterialIcons name="photo-library" size={20} color={CORES.ameixa} />
            <Text style={styles.textoDaAcao}>Da galeria</Text>
          </Pressable>

          {/* Remover só aparece quando há o que remover. */}
          {temFoto ? (
            <Pressable
              style={({ pressed }) => [styles.acao, pressed ? styles.pressionado : null]}
              onPress={() => props.aoMudarFoto('')}
            >
              <MaterialIcons name="delete-outline" size={20} color={CORES.framboesa} />
              <Text style={[styles.textoDaAcao, styles.textoRemover]}>Remover</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Text style={styles.dica}>
        Opcional. Ajuda a reconhecer a caixa na hora de tomar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    marginBottom: 16,
  },
  rotulo: {
    fontFamily: FONTES.textoForte,
    fontSize: 15,
    color: CORES.ameixa,
    marginBottom: 6,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acoes: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // Altura mínima de 44 para o dedo acertar o toque com folga.
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pressionado: {
    backgroundColor: CORES.lavandaClara,
  },
  textoDaAcao: {
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixa,
  },
  textoRemover: {
    color: CORES.framboesa,
  },
  dica: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
    marginTop: 6,
  },
});
