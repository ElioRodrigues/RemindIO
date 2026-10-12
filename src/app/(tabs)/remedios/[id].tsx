import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { Botao } from '../../../components/Botao';
import { FotoDoRemedio } from '../../../components/FotoDoRemedio';
import { CORES } from '../../../constants/cores';
import { FONTES, TAMANHOS } from '../../../constants/fontes';
import { dataPorExtenso } from '../../../services/datas';
import { situacaoDaDose } from '../../../services/doses';
import { apagarFoto } from '../../../services/fotos';
import { atualizarLembretes } from '../../../services/lembretes';
import { doseValeHoje } from '../../../services/pet';
import {
  buscarRemedioPorId,
  excluirRemedio,
  listarTomadas,
} from '../../../services/storage';
import { Remedio, Tomada } from '../../../types';

// Como cada situação aparece na lista de horários de hoje. São as mesmas
// palavras e cores da cartela, para o usuário reconhecer.
const TEXTO_DA_SITUACAO = {
  tomada: 'Tomada hoje',
  liberada: 'É a hora desta dose',
  atrasada: 'Atrasada',
  aguardando: 'Ainda não chegou a hora',
};

const COR_DA_SITUACAO = {
  tomada: CORES.salvia,
  liberada: CORES.ambar,
  atrasada: CORES.framboesa,
  aguardando: CORES.ameixaSuave,
};

export default function DetalheRemedio() {
  // O [id] do nome do arquivo vira um parâmetro: a lista abre
  // /remedios/1728600000000, e aqui chega id = '1728600000000'.
  const { id } = useLocalSearchParams<{ id: string }>();
  const [remedio, setRemedio] = useState<Remedio | null>(null);
  const [tomadas, setTomadas] = useState<Tomada[]>([]);
  // Diferencia "ainda carregando" de "não existe": sem isso, a tela
  // mostraria "remédio não encontrado" por um instante ao abrir.
  const [carregou, setCarregou] = useState(false);
  // Se a foto está aberta em tela cheia.
  const [fotoAmpliada, setFotoAmpliada] = useState(false);

  // useFocusEffect, e não useEffect: ao voltar da tela de editar, esta
  // precisa mostrar o remédio já alterado.
  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        const encontrado = await buscarRemedioPorId(id);
        const listaDeTomadas = await listarTomadas();

        setRemedio(encontrado);
        setTomadas(listaDeTomadas);
        setCarregou(true);
      }

      carregarDados();
    }, [id])
  );

  function confirmarExclusao() {
    if (remedio === null) {
      return;
    }

    // Excluir não tem volta, então perguntamos antes, dizendo o que acontece.
    Alert.alert(
      'Excluir ' + remedio.nome + '?',
      'Ele sai da cartela e da lista. As doses já confirmadas continuam no histórico.',
      [
        { text: 'Cancelar' },
        // style destructive deixa o botão vermelho no iOS.
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
    );
  }

  async function excluir() {
    if (remedio === null) {
      return;
    }

    await excluirRemedio(remedio.id);
    // Sem o remédio, a foto dele não aparece em lugar nenhum: libera espaço.
    apagarFoto(remedio.foto ?? '');
    // Remédio excluído não avisa mais.
    await atualizarLembretes();

    if (Platform.OS === 'android') {
      ToastAndroid.show(remedio.nome + ' excluído', ToastAndroid.SHORT);
    }

    // Volta para a lista, que já não tem mais o remédio.
    router.back();
  }

  if (!carregou) {
    return <View style={styles.tela} />;
  }

  // Pode acontecer se o remédio foi excluído e a rota ficou para trás.
  if (remedio === null) {
    return (
      <View style={[styles.tela, styles.conteudo]}>
        <Text style={styles.texto}>
          Este remédio não existe mais. Volte para a lista de remédios.
        </Text>
      </View>
    );
  }

  const frequencia =
    remedio.intervaloEmHoras > 0
      ? 'A cada ' +
        remedio.intervaloEmHoras +
        ' horas, começando às ' +
        remedio.horarios[0]
      : 'Todos os dias, nos horários marcados';

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.topo}>
        {/* Tocar na foto abre ela grande, para ler a receita ou a caixa.
            Sem foto, o toque não faz nada (disabled). */}
        <Pressable
          style={styles.foto}
          onPress={() => setFotoAmpliada(true)}
          disabled={!remedio.foto}
        >
          <FotoDoRemedio foto={remedio.foto} tamanho={96} />
          {remedio.foto ? (
            <View style={styles.lupa}>
              <MaterialIcons name="zoom-in" size={18} color={CORES.ameixa} />
            </View>
          ) : null}
        </Pressable>

        <View style={styles.identificacao}>
          <Text style={styles.nome}>{remedio.nome}</Text>
          <Text style={styles.dosagem}>{remedio.dosagem}</Text>
        </View>
      </View>

      <Text style={styles.secao}>Horários de hoje</Text>
      <View style={styles.cartao}>
        {/* map, e não FlatList: são poucos horários e estão dentro de um
            ScrollView (FlatList dentro de ScrollView dá aviso e não ganha
            nada). */}
        {remedio.horarios.map((horario, indice) => {
          // Horário que já tinha passado quando o remédio foi cadastrado:
          // só conta a partir de amanhã (a mesma regra da cartela).
          let texto = 'Começa amanhã';
          let cor = CORES.ameixaSuave;

          if (doseValeHoje(remedio, horario)) {
            const situacao = situacaoDaDose(
              { remedio: remedio, horario: horario },
              tomadas
            );
            texto = TEXTO_DA_SITUACAO[situacao];
            cor = COR_DA_SITUACAO[situacao];
          }

          return (
            <View key={horario}>
              {indice > 0 ? <View style={styles.divisoria} /> : null}
              <View style={styles.linha}>
                <Text style={styles.horario}>{horario}</Text>
                <Text style={[styles.situacao, { color: cor }]}>{texto}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.secao}>Como tomar</Text>
      <View style={styles.cartao}>
        <View style={styles.bloco}>
          <Text style={styles.rotulo}>Frequência</Text>
          <Text style={styles.texto}>{frequencia}</Text>
        </View>
        <View style={styles.divisoria} />
        <View style={styles.bloco}>
          <Text style={styles.rotulo}>Observação</Text>
          <Text style={styles.texto}>
            {remedio.observacao === '' ? 'Nenhuma' : remedio.observacao}
          </Text>
        </View>
        <View style={styles.divisoria} />
        <View style={styles.bloco}>
          <Text style={styles.rotulo}>Cadastrado em</Text>
          {/* O id é o instante do cadastro, em milissegundos. */}
          <Text style={styles.texto}>{dataPorExtenso(Number(remedio.id))}</Text>
        </View>
      </View>

      {/* A foto em tela cheia. Fecha tocando em qualquer lugar ou com o
          botão de voltar do Android (onRequestClose). */}
      <Modal
        visible={fotoAmpliada}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoAmpliada(false)}
      >
        <Pressable style={styles.veu} onPress={() => setFotoAmpliada(false)}>
          {remedio.foto ? (
            // contain mostra a foto inteira, sem cortar nada.
            <Image
              source={{ uri: remedio.foto }}
              style={styles.fotoGrande}
              resizeMode="contain"
            />
          ) : null}
          <Text style={styles.fecharFoto}>Toque para fechar</Text>
        </Pressable>
      </Modal>

      <View style={styles.acoes}>
        <Botao
          titulo="Editar remédio"
          aoPressionar={() => router.push('/remedios/editar/' + remedio.id)}
        />
        <Botao
          titulo="Excluir remédio"
          variante="perigo"
          aoPressionar={confirmarExclusao}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.nevoa,
  },
  conteudo: {
    padding: 20,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  foto: {
    marginRight: 16,
  },
  // O selinho de lupa no canto da foto: avisa que dá para ampliar.
  lupa: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: CORES.branco,
    borderRadius: 999,
    padding: 3,
  },
  veu: {
    flex: 1,
    backgroundColor: CORES.veu,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fotoGrande: {
    width: '100%',
    // aspectRatio 1: a altura é igual à largura, como a foto quadrada.
    aspectRatio: 1,
    borderRadius: 20,
  },
  fecharFoto: {
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.texto,
    color: CORES.branco,
    marginTop: 16,
  },
  identificacao: {
    flex: 1,
  },
  nome: {
    fontFamily: FONTES.tituloForte,
    fontSize: TAMANHOS.titulo,
    lineHeight: 32,
    color: CORES.ameixa,
  },
  dosagem: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.destaque,
    color: CORES.ameixaSuave,
  },
  secao: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    color: CORES.ameixa,
    marginBottom: 8,
  },
  cartao: {
    backgroundColor: CORES.branco,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  horario: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    color: CORES.ameixa,
  },
  situacao: {
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.detalhe,
  },
  bloco: {
    paddingVertical: 12,
  },
  rotulo: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
    marginBottom: 2,
  },
  texto: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixa,
  },
  divisoria: {
    height: 1,
    backgroundColor: CORES.lavandaClara,
  },
  acoes: {
    gap: 12,
  },
});
