import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../../components/Botao';
import { Cabecalho } from '../../components/Cabecalho';
import { CORES } from '../../constants/cores';
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

  // Aqui basta o useEffect: quem está logado não muda enquanto a aba existe.
  useEffect(() => {
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
  }, []);

  function confirmarSaida() {
    // Sair é uma ação destrutiva, então perguntamos antes de fazer.
    Alert.alert('Sair da conta', 'Você quer mesmo sair?', [
      { text: 'Cancelar' },
      { text: 'Sair', onPress: sair },
    ]);
  }

  async function sair() {
    await limparSessao();

    // replace para o botão de voltar não retornar ao app já deslogado.
    router.replace('/');
  }

  return (
    <View style={styles.tela}>
      <Cabecalho titulo="Ajustes" subtitulo="Sua conta e seu pet" />

      <View style={styles.cartao}>
        <Text style={styles.rotulo}>Nome</Text>
        <Text style={styles.valor}>
          {usuario === null ? 'Carregando...' : usuario.nome}
        </Text>

        <Text style={styles.rotulo}>E-mail</Text>
        <Text style={styles.valor}>
          {usuario === null ? 'Carregando...' : usuario.email}
        </Text>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.rotulo}>Pet</Text>
        <Text style={styles.valor}>
          {pet === null
            ? 'Nenhum pet ainda'
            : pet.nome + ' — ' + saudeDoPet + '% de saúde'}
        </Text>

        <Text style={styles.rotulo}>Remédios cadastrados</Text>
        <Text style={styles.valor}>{totalDeRemedios}</Text>
      </View>

      <Botao
        titulo="Sair da conta"
        variante="secundario"
        aoPressionar={confirmarSaida}
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
  cartao: {
    borderWidth: 1,
    borderColor: CORES.sol,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rotulo: {
    fontSize: 12,
    color: CORES.roxo,
    marginBottom: 2,
  },
  valor: {
    fontSize: 16,
    color: CORES.noite,
    marginBottom: 12,
  },
});
