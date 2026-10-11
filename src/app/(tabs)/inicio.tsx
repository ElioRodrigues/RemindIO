import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { BarraSaude } from '../../components/BarraSaude';
import { Botao } from '../../components/Botao';
import { CORES } from '../../constants/cores';
import {
  dataDeHoje,
  horarioEmMinutos,
  minutosEmHorario,
} from '../../services/datas';
import {
  ANTECEDENCIA_EM_MINUTOS,
  montarDosesDeHoje,
  situacaoDaDose,
} from '../../services/doses';
import { calcularSaude, estadoDoPet } from '../../services/pet';
import {
  lerPet,
  listarRemedios,
  listarTomadas,
  registrarTomada,
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
  saudavel: 'Está ótimo! Continue confirmando as doses no horário.',
  abatido: 'Ficou meio abatido. Não deixe passar as próximas doses.',
  doente: 'Está doente. Você perdeu várias doses seguidas.',
};

export default function Inicio() {
  const [pet, setPet] = useState<Pet | null>(null);
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

    // Relê as tomadas para o botão virar "Tomada" na tela.
    const listaAtualizada = await listarTomadas();
    setTomadas(listaAtualizada);

    if (Platform.OS === 'android') {
      const aviso = atrasada ? 'Dose confirmada com atraso' : 'Dose confirmada!';
      ToastAndroid.show(aviso, ToastAndroid.SHORT);
    }
  }

  // A saúde sai do histórico, então já reflete qualquer dose vencida agora.
  const saude = calcularSaude(remedios, tomadas);
  const estado = estadoDoPet(saude);

  return (
    <View style={styles.tela}>
      <View style={styles.areaDoPet}>
        <Image source={DESENHOS_DO_PET[estado]} style={styles.desenhoDoPet} />

        <Text style={styles.nomeDoPet}>
          {pet === null ? 'Seu pet' : pet.nome}
        </Text>

        <Text style={styles.fraseDoPet}>{FRASES_DO_PET[estado]}</Text>
      </View>

      <BarraSaude saude={saude} />

      <Text style={styles.secao}>Doses de hoje</Text>

      <FlatList
        data={doses}
        keyExtractor={(dose) => dose.remedio.id + dose.horario}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhum remédio cadastrado ainda. Vá até a aba Remédios.
          </Text>
        }
        renderItem={({ item }) => {
          const situacao = situacaoDaDose(item, tomadas);

          // Antes da janela o botão não aparece: mostramos a partir de
          // quando a dose pode ser confirmada.
          const liberaAs = minutosEmHorario(
            horarioEmMinutos(item.horario) - ANTECEDENCIA_EM_MINUTOS
          );

          return (
            <View style={styles.dose}>
              <View style={styles.doseTexto}>
                <Text style={styles.doseNome}>{item.remedio.nome}</Text>
                <Text style={styles.doseHorario}>
                  {item.horario}
                  {situacao === 'atrasada' ? ' (atrasada)' : ''}
                </Text>
              </View>

              {situacao === 'tomada' ? (
                <Text style={styles.tomada}>Tomada</Text>
              ) : null}

              {situacao === 'aguardando' ? (
                <Text style={styles.aguardando}>a partir de {liberaAs}</Text>
              ) : null}

              {situacao === 'liberada' || situacao === 'atrasada' ? (
                <Botao titulo="Tomei" aoPressionar={() => confirmarDose(item)} />
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.gelo,
    padding: 20,
  },
  areaDoPet: {
    alignItems: 'center',
    marginBottom: 12,
  },
  desenhoDoPet: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  nomeDoPet: {
    fontSize: 26,
    fontWeight: 'bold',
    color: CORES.noite,
    marginTop: 4,
  },
  fraseDoPet: {
    fontSize: 13,
    color: CORES.roxo,
    textAlign: 'center',
    marginTop: 2,
  },
  secao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORES.noite,
    marginBottom: 12,
  },
  vazio: {
    fontSize: 14,
    color: CORES.roxo,
  },
  dose: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CORES.gelo,
    borderWidth: 1,
    borderColor: CORES.sol,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  doseTexto: {
    flex: 1,
  },
  doseNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CORES.noite,
  },
  doseHorario: {
    fontSize: 14,
    color: CORES.coral,
    marginTop: 2,
  },
  aguardando: {
    fontSize: 13,
    color: CORES.roxo,
  },
  tomada: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CORES.menta,
  },
});
