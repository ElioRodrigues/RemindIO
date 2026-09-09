import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../../components/Botao';
import { CardRemedio } from '../../../components/CardRemedio';
import { CORES } from '../../../constants/cores';
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
      remedio.observacao === ''
        ? 'Sem observações.'
        : remedio.observacao;

    Alert.alert(remedio.nome, remedio.dosagem + '\n\n' + observacao);
  }

  return (
    <View style={styles.tela}>
      <FlatList
        data={remedios}
        keyExtractor={(remedio) => remedio.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Você ainda não cadastrou nenhum remédio.
          </Text>
        }
        renderItem={({ item }) => (
          <CardRemedio
            remedio={item}
            aoPressionar={() => mostrarDetalhes(item)}
          />
        )}
      />

      <Botao
        titulo="Novo remédio"
        aoPressionar={() => router.push('/remedios/novo')}
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
  vazio: {
    fontSize: 14,
    color: CORES.roxo,
  },
});
