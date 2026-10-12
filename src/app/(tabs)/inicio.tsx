import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarraSaude } from '../../components/BarraSaude';
import { BolhaDose } from '../../components/BolhaDose';
import { Botao } from '../../components/Botao';
import { CORES } from '../../constants/cores';
import { FONTES, TAMANHOS } from '../../constants/fontes';
import {
  dataDeHoje,
  horarioEmMinutos,
  minutosEmHorario,
  saudacao,
} from '../../services/datas';
import {
  ANTECEDENCIA_EM_MINUTOS,
  montarDosesDeHoje,
  situacaoDaDose,
} from '../../services/doses';
import { calcularSaude, estadoDoPet } from '../../services/pet';
import {
  buscarUsuarioPorEmail,
  lerPet,
  lerSessao,
  listarRemedios,
  listarTomadas,
  registrarTomada,
  removerTomada,
  salvarPet,
} from '../../services/storage';
import { Dose, Pet, Remedio, Tomada } from '../../types';

// Os três desenhos ficam em assets/pet. O require precisa do caminho
// escrito por extenso: ele é resolvido antes do app rodar.
const DESENHOS_DO_PET = {
  saudavel: require('../../../assets/pet/saudavel.png'),
  abatido: require('../../../assets/pet/abatido.png'),
  doente: require('../../../assets/pet/doente.png'),
};

const FRASES_DO_PET = {
  saudavel: 'Está ótimo. Continue confirmando as doses no horário.',
  abatido: 'Ficou abatido. Não deixe passar as próximas doses.',
  doente: 'Está doente: várias doses passaram sem confirmação.',
};

export default function Inicio() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [nomeDoUsuario, setNomeDoUsuario] = useState('');
  const [remedios, setRemedios] = useState<Remedio[]>([]);
  const [tomadas, setTomadas] = useState<Tomada[]>([]);

  // useFocusEffect roda toda vez que a aba aparece, e não só na primeira.
  // Sem isso, um remédio cadastrado agora não apareceria nas doses de hoje.
  // O useCallback não é otimização: sem ele o efeito rodaria em loop.
  useFocusEffect(
    useCallback(() => {
      // A função async fica aqui dentro porque o efeito não aceita async.
      async function carregarDados() {
        const listaDeRemedios = await listarRemedios();
        const listaDeTomadas = await listarTomadas();
        const petSalvo = await lerPet();

        setRemedios(listaDeRemedios);
        setTomadas(listaDeTomadas);

        // Só o primeiro nome, para a saudação ficar curta.
        const email = await lerSessao();
        if (email !== null) {
          const usuario = await buscarUsuarioPorEmail(email);
          if (usuario !== null) {
            setNomeDoUsuario(usuario.nome.split(' ')[0]);
          }
        }

        // Primeiro acesso da conta: o pet ainda não existe, então nasce
        // aqui. Só depois do login, para ter dono.
        if (petSalvo === null) {
          const petNovo = { nome: 'Pipo' };
          await salvarPet(petNovo);
          setPet(petNovo);
          return;
        }

        setPet(petSalvo);
      }

      carregarDados();
    }, [])
  );

  // Uma dose por horário de cada remédio, já em ordem de horário.
  const doses = montarDosesDeHoje(remedios);

  async function confirmarDose(dose: Dose) {
    // A mesma regra que pinta a dose de atrasada na tela decide o que é
    // gravado, para a tela e o pet nunca discordarem.
    const atrasada = situacaoDaDose(dose, tomadas) === 'atrasada';

    await registrarTomada({
      remedioId: dose.remedio.id,
      horario: dose.horario,
      data: dataDeHoje(),
      atrasada: atrasada,
    });

    // Relê as tomadas para a bolha virar "tomada" na tela.
    const listaAtualizada = await listarTomadas();
    setTomadas(listaAtualizada);

    if (Platform.OS === 'android') {
      const aviso = atrasada
        ? 'Dose das ' + dose.horario + ' registrada com atraso'
        : 'Dose das ' + dose.horario + ' registrada';
      ToastAndroid.show(aviso, ToastAndroid.SHORT);
    }
  }

  // Desfazer pede confirmação: o toque em "Desfazer" também pode ser um
  // engano, e aí a pessoa perderia a dose que tinha marcado certo.
  function confirmarDesfazer(dose: Dose) {
    Alert.alert(
      'Desfazer a dose das ' + dose.horario + '?',
      dose.remedio.nome + ' volta a aparecer como não tomada.',
      [
        { text: 'Cancelar' },
        { text: 'Desfazer', onPress: () => desfazerDose(dose) },
      ]
    );
  }

  async function desfazerDose(dose: Dose) {
    await removerTomada(dose.remedio.id, dose.horario, dataDeHoje());

    // Relê as tomadas: a bolha volta ao estado de antes, e a saúde do pet,
    // que é calculada a partir delas, se corrige sozinha.
    const listaAtualizada = await listarTomadas();
    setTomadas(listaAtualizada);
  }

  // A saúde sai do histórico, então já reflete qualquer dose vencida agora.
  const saude = calcularSaude(remedios, tomadas);
  const estado = estadoDoPet(saude);

  // Quantas doses de hoje já foram tomadas, para o "3 de 8 tomadas".
  let totalTomadas = 0;
  for (let i = 0; i < doses.length; i++) {
    if (situacaoDaDose(doses[i], tomadas) === 'tomada') {
      totalTomadas = totalTomadas + 1;
    }
  }

  // Tudo o que fica acima da cartela. Vai como cabeçalho da FlatList para a
  // tela inteira rolar junto: com o pet fora da lista, sobraria pouco espaço
  // para as doses em celulares menores.
  const topoDaTela = (
    <View>
      <Text style={styles.saudacao}>
        {saudacao()}
        {nomeDoUsuario === '' ? '' : ', ' + nomeDoUsuario}
      </Text>

      <View style={styles.painelDoPet}>
        <View style={styles.areaDoDesenho}>
          <Image
            source={DESENHOS_DO_PET[estado]}
            style={styles.desenhoDoPet}
            resizeMode="contain"
          />
        </View>

        <View style={styles.linhaDoPet}>
          <Text style={styles.nomeDoPet}>
            {pet === null ? 'Seu pet' : pet.nome}
          </Text>
          <Text style={styles.saude}>{saude}%</Text>
        </View>

        <BarraSaude saude={saude} />

        <Text style={styles.fraseDoPet}>{FRASES_DO_PET[estado]}</Text>
      </View>

      <View style={styles.linhaDaCartela}>
        <Text style={styles.tituloDaCartela}>Cartela de hoje</Text>
        {doses.length > 0 ? (
          <Text style={styles.contagem}>
            {totalTomadas} de {doses.length} tomadas
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    // SafeAreaView afasta o conteúdo da barra de status, já que esta aba
    // não tem cabeçalho. edges diz que só o topo precisa: embaixo já estão
    // as abas.
    <SafeAreaView style={styles.tela} edges={['top']}>
      <FlatList
        data={doses}
        keyExtractor={(dose) => dose.remedio.id + dose.horario}
        contentContainerStyle={styles.conteudo}
        ListHeaderComponent={topoDaTela}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.textoVazio}>
              Cadastre o primeiro remédio para montar a cartela de hoje.
            </Text>
            <Botao
              titulo="Cadastrar remédio"
              // origem=hoje avisa o formulário para voltar a esta tela
              // depois de salvar, e não para a lista de remédios.
              // withAnchor põe a lista (o initialRouteName da pilha de
              // remédios) embaixo do formulário. Sem ele, se a aba Remédios
              // nunca foi aberta, a pilha nascia só com o formulário, sem
              // seta de voltar.
              aoPressionar={() =>
                router.push('/remedios/novo?origem=hoje', { withAnchor: true })
              }
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <BolhaDose
            dose={item}
            situacao={situacaoDaDose(item, tomadas)}
            // Antes da janela o botão não aparece: mostramos a partir de
            // quando a dose pode ser confirmada.
            liberaAs={minutosEmHorario(
              horarioEmMinutos(item.horario) - ANTECEDENCIA_EM_MINUTOS
            )}
            ultima={index === doses.length - 1}
            aoConfirmar={() => confirmarDose(item)}
            aoDesfazer={() => confirmarDesfazer(item)}
          />
        )}
      />
    </SafeAreaView>
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
  saudacao: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.titulo,
    color: CORES.ameixa,
    marginBottom: 12,
  },
  painelDoPet: {
    backgroundColor: CORES.lavandaClara,
    borderRadius: 28,
    padding: 20,
    marginBottom: 28,
  },
  areaDoDesenho: {
    alignItems: 'center',
    marginBottom: 4,
  },
  desenhoDoPet: {
    width: 170,
    height: 170,
  },
  linhaDoPet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  nomeDoPet: {
    fontFamily: FONTES.tituloForte,
    fontSize: TAMANHOS.titulo,
    color: CORES.ameixa,
  },
  saude: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    color: CORES.ameixa,
  },
  fraseDoPet: {
    fontFamily: FONTES.texto,
    fontSize: 15,
    color: CORES.ameixaSuave,
    marginTop: 10,
  },
  linhaDaCartela: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  tituloDaCartela: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    color: CORES.ameixa,
  },
  contagem: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
  },
  vazio: {
    gap: 16,
  },
  textoVazio: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixaSuave,
  },
});
