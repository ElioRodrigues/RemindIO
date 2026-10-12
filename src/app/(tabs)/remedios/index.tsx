import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../../components/Botao';
import { CardRemedio } from '../../../components/CardRemedio';
import { CORES } from '../../../constants/cores';
import { FONTES, TAMANHOS } from '../../../constants/fontes';
import { listarRemedios } from '../../../services/storage';
import { Remedio } from '../../../types';

export default function ListaRemedios() {
  const [remedios, setRemedios] = useState<Remedio[]>([]);

  // useFocusEffect roda toda vez que a tela aparece, e não só na primeira.
  // É o que faz a lista já mostrar o remédio recém-cadastrado ao voltar.
  // O useCallback aqui não é otimização: sem ele a função seria nova a cada
  // render e o efeito rodaria em loop.
  useFocusEffect(
    useCallback(() => {
      async function carregarRemedios() {
        const lista = await listarRemedios();
        setRemedios(lista);
      }

      carregarRemedios();
    }, [])
  );

  function mostrarDetalhes(remedio: Remedio) {
    const observacao =
      remedio.observacao === '' ? 'Sem observação.' : remedio.observacao;

    Alert.alert(remedio.nome, remedio.dosagem + '\n\n' + observacao);
  }

  return (
    <View style={styles.tela}>
      <FlatList
        data={remedios}
        keyExtractor={(remedio) => remedio.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhum remédio ainda. Cadastre o primeiro: o nome, a dose e os
            horários em que você toma.
          </Text>
        }
        renderItem={({ item }) => (
          <CardRemedio
            remedio={item}
            aoPressionar={() => mostrarDetalhes(item)}
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
