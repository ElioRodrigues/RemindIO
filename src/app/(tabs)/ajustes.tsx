import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../components/Botao';
import { CORES } from '../../constants/cores';
import { FONTES, TAMANHOS } from '../../constants/fontes';
import { calcularSaude } from '../../services/pet';
import {
  buscarUsuarioPorEmail,
  lerPet,
  lerSessao,
  limparSessao,
  listarRemedios,
  listarTomadas,
} from '../../services/storage';
import { Pet, Usuario } from '../../types';

export default function Ajustes() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [totalDeRemedios, setTotalDeRemedios] = useState(0);
  const [saudeDoPet, setSaudeDoPet] = useState(0);

  // useFocusEffect, e não useEffect: a aba não é desmontada ao trocar de aba.
  // Com useEffect, a saúde e o total de remédios ficavam com o valor da
  // primeira vez que a aba abriu, mesmo depois de confirmar doses no Início.
  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        const email = await lerSessao();

        if (email !== null) {
          const usuarioSalvo = await buscarUsuarioPorEmail(email);
          setUsuario(usuarioSalvo);
        }

        const petSalvo = await lerPet();
        setPet(petSalvo);

        const lista = await listarRemedios();
        setTotalDeRemedios(lista.length);

        // A mesma conta da tela de Início, para os dois números baterem.
        const tomadas = await listarTomadas();
        setSaudeDoPet(calcularSaude(lista, tomadas));
      }

      carregarDados();
    }, [])
  );

  function confirmarSaida() {
    // Sair é uma ação destrutiva, então perguntamos antes de fazer.
    Alert.alert(
      'Sair da conta?',
      'Seus remédios continuam salvos. É só entrar de novo para vê-los.',
      [
        { text: 'Cancelar' },
        { text: 'Sair', onPress: sair },
      ]
    );
  }

  async function sair() {
    await limparSessao();

    // replace para o botão de voltar não retornar ao app já deslogado.
    router.replace('/');
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.grupo}>Sua conta</Text>
      <View style={styles.cartao}>
        <View style={styles.linha}>
          <Text style={styles.rotulo}>Nome</Text>
          <Text style={styles.valor}>
            {usuario === null ? '' : usuario.nome}
          </Text>
        </View>
        {/* A divisória fica entre as linhas, e não embaixo da última. */}
        <View style={styles.divisoria} />
        <View style={styles.linha}>
          <Text style={styles.rotulo}>E-mail</Text>
          <Text style={styles.valor}>
            {usuario === null ? '' : usuario.email}
          </Text>
        </View>
      </View>

      <Text style={styles.grupo}>Seu pet</Text>
      <View style={styles.cartao}>
        <View style={styles.linha}>
          <Text style={styles.rotulo}>Nome</Text>
          <Text style={styles.valor}>{pet === null ? '' : pet.nome}</Text>
        </View>
        <View style={styles.divisoria} />
        <View style={styles.linha}>
          <Text style={styles.rotulo}>Saúde</Text>
          <Text style={styles.valor}>{saudeDoPet}%</Text>
        </View>
        <View style={styles.divisoria} />
        <View style={styles.linha}>
          <Text style={styles.rotulo}>Remédios cadastrados</Text>
          <Text style={styles.valor}>{totalDeRemedios}</Text>
        </View>
      </View>

      <View style={styles.sair}>
        <Botao
          titulo="Sair da conta"
          variante="secundario"
          aoPressionar={confirmarSaida}
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
  grupo: {
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
    paddingVertical: 14,
    gap: 12,
  },
  divisoria: {
    height: 1,
    backgroundColor: CORES.lavandaClara,
  },
  rotulo: {
    fontFamily: FONTES.texto,
    fontSize: 15,
    color: CORES.ameixaSuave,
  },
  valor: {
    // flexShrink deixa um e-mail comprido quebrar a linha em vez de
    // empurrar o rótulo para fora da tela.
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixa,
  },
  sair: {
    marginTop: 8,
  },
});
