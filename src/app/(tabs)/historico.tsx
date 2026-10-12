import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { DiaDoHistorico } from '../../components/DiaDoHistorico';
import { CORES } from '../../constants/cores';
import { FONTES, TAMANHOS } from '../../constants/fontes';
import {
  adesaoDosUltimosDias,
  montarHistorico,
  sequenciaDeDias,
} from '../../services/historico';
import { listarRemedios, listarTomadas } from '../../services/storage';
import { ResumoDoDia } from '../../types';

export default function Historico() {
  const [historico, setHistorico] = useState<ResumoDoDia[]>([]);

  // useFocusEffect: ao confirmar doses ou cadastrar remédios e voltar, o
  // histórico precisa refletir isso. Com useEffect ficaria parado no valor
  // da primeira vez que a aba abriu.
  useFocusEffect(
    useCallback(() => {
      async function carregarHistorico() {
        const remedios = await listarRemedios();
        const tomadas = await listarTomadas();

        // A conta fica no service; a tela só guarda o resultado.
        setHistorico(montarHistorico(remedios, tomadas));
      }

      carregarHistorico();
    }, [])
  );

  const adesao = adesaoDosUltimosDias(historico, 7);
  const sequencia = sequenciaDeDias(historico);

  // Os dois números do topo. Vão como cabeçalho da FlatList para rolarem
  // junto com os dias.
  const resumo = (
    <View style={styles.resumo}>
      <View style={styles.numero}>
        <Text style={styles.valor}>{adesao === null ? '—' : adesao + '%'}</Text>
        <Text style={styles.rotulo}>das doses tomadas nos últimos 7 dias</Text>
      </View>

      <View style={styles.numero}>
        <Text style={styles.valor}>{sequencia}</Text>
        <Text style={styles.rotulo}>
          {sequencia === 1
            ? 'dia seguido sem perder dose'
            : 'dias seguidos sem perder dose'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.tela}>
      {/* FlatList porque a lista cresce um dia por dia de uso (até 60). Ela
          só desenha os dias que cabem na tela, e vai desenhando os outros
          conforme o usuário rola. */}
      <FlatList
        data={historico}
        keyExtractor={(dia) => dia.data}
        contentContainerStyle={styles.conteudo}
        ListHeaderComponent={historico.length > 0 ? resumo : null}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            O histórico começa amanhã. Cada dia que passa aparece aqui, com
            quantas doses você tomou.
          </Text>
        }
        renderItem={({ item }) => <DiaDoHistorico dia={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.nevoa,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  resumo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  numero: {
    // flex: 1 nos dois divide a linha ao meio.
    flex: 1,
    backgroundColor: CORES.lavandaClara,
    borderRadius: 20,
    padding: 16,
  },
  valor: {
    fontFamily: FONTES.tituloForte,
    fontSize: TAMANHOS.tituloGrande,
    lineHeight: 42,
    color: CORES.ameixa,
  },
  rotulo: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
  },
  vazio: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixaSuave,
  },
});
