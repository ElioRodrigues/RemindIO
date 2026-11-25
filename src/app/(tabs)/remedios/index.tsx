import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../../components/Botao';
import { CardRemedio } from '../../../components/CardRemedio';
import { CORES } from '../../../constants/cores';
import { FONTES, TAMANHOS } from '../../../constants/fontes';
import { avisarErro } from '../../../services/erros';
import { listarRemedios } from '../../../services/storage';
import { Remedio } from '../../../types';

export default function ListaRemedios() {
  const [remedios, setRemedios] = useState<Remedio[]>([]);
  // Os remédios agora vêm da internet e levam um instante. Sem este estado,
  // a lista mostraria "Nenhum remédio ainda" até a resposta chegar.
  const [carregando, setCarregando] = useState(true);
  // true enquanto a pessoa puxa a lista para baixo para recarregar.
  const [atualizando, setAtualizando] = useState(false);

  async function carregarRemedios() {
    try {
      const lista = await listarRemedios();
      setRemedios(lista);
    } catch (erro) {
      avisarErro('Não deu para carregar os remédios', erro);
    }
    setCarregando(false);
  }

  // useFocusEffect roda toda vez que a tela aparece, e não só na primeira.
  // É o que faz a lista já mostrar o remédio recém-cadastrado ao voltar.
  // O useCallback aqui não é otimização: sem ele a função seria nova a cada
  // render e o efeito rodaria em loop.
  useFocusEffect(
    useCallback(() => {
      carregarRemedios();
    }, [])
  );

  // "Puxar para atualizar": útil quando a mesma conta foi usada em outro
  // aparelho, ou depois de uma falha de conexão.
  async function puxarParaAtualizar() {
    setAtualizando(true);
    await carregarRemedios();
    setAtualizando(false);
  }

  return (
    <View style={styles.tela}>
      <FlatList
        data={remedios}
        keyExtractor={(remedio) => remedio.id}
        contentContainerStyle={styles.lista}
        // refreshing e onRefresh ligam o "puxar para atualizar" da FlatList.
        refreshing={atualizando}
        onRefresh={puxarParaAtualizar}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color={CORES.lavanda} size="large" />
          ) : (
            <Text style={styles.vazio}>
              Nenhum remédio ainda. Cadastre o primeiro: o nome, a dose e os
              horários em que você toma.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <CardRemedio
            remedio={item}
            // Abre a tela de detalhe deste remédio: /remedios/<id>
            aoPressionar={() => router.push('/remedios/' + item.id)}
          />
        )}
      />

      {/* O botão fica fora da lista, preso embaixo: com muitos remédios
          ele continua à vista, sem precisar rolar até o fim. */}
      <View style={styles.rodape}>
        <Botao
          titulo="Cadastrar remédio"
          aoPressionar={() => router.push('/remedios/novo')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.nevoa,
  },
  lista: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  vazio: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixaSuave,
  },
  rodape: {
    padding: 20,
    paddingTop: 8,
  },
});
