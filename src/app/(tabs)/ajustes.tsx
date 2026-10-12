import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { Botao } from '../../components/Botao';
import { JanelaNomeDoPet } from '../../components/JanelaNomeDoPet';
import { CORES } from '../../constants/cores';
import { FONTES, TAMANHOS } from '../../constants/fontes';
import {
  atualizarLembretes,
  cancelarLembretes,
  lembretesPermitidos,
} from '../../services/lembretes';
import { calcularSaude } from '../../services/pet';
import {
  buscarUsuarioPorEmail,
  lerPet,
  lerSessao,
  limparSessao,
  listarRemedios,
  listarTomadas,
  salvarPet,
} from '../../services/storage';
import { Pet, Usuario } from '../../types';

export default function Ajustes() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [totalDeRemedios, setTotalDeRemedios] = useState(0);
  const [saudeDoPet, setSaudeDoPet] = useState(0);
  // Controla se a janela de renomear o pet está aberta.
  const [janelaAberta, setJanelaAberta] = useState(false);
  // Se o aparelho deixa o app mostrar notificações.
  const [lembretesLigados, setLembretesLigados] = useState(false);

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

        // Consultado a cada visita: o usuário pode ter ido às configurações
        // do aparelho, liberado as notificações e voltado.
        const permitidos = await lembretesPermitidos();
        setLembretesLigados(permitidos);
        if (permitidos) {
          // Se acabou de liberar, os lembretes ainda não existem.
          await atualizarLembretes();
        }
      }

      carregarDados();
    }, [])
  );

  async function renomearPet(novoNome: string) {
    await salvarPet({ nome: novoNome });
    // Atualiza o estado para a tela mostrar o nome novo sem reabrir a aba.
    setPet({ nome: novoNome });
    setJanelaAberta(false);
    // O nome do pet aparece no texto dos lembretes.
    await atualizarLembretes();

    if (Platform.OS === 'android') {
      ToastAndroid.show('Agora o pet se chama ' + novoNome, ToastAndroid.SHORT);
    }
  }

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
    // Os lembretes são da conta: quem saiu não deve mais ser avisado.
    await cancelarLembretes();
    await limparSessao();

    // replace para o botão de voltar não retornar ao app já deslogado.
    router.replace('/');
  }

  return (
    // A janela fica FORA do ScrollView, como irmã dele. Dentro, o ScrollView
    // da tela "engolia" o primeiro toque em "Salvar nome" para fechar o
    // teclado, e era preciso tocar duas vezes. O <> </> (fragmento) junta os
    // dois sem criar uma View a mais.
    <>
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
          {/* A linha inteira é tocável e o lápis indica que dá para mudar. */}
          <Pressable
            style={({ pressed }) => [
              styles.linha,
              pressed ? styles.linhaPressionada : null,
            ]}
            onPress={() => setJanelaAberta(true)}
          >
            <Text style={styles.rotulo}>Nome</Text>
            <View style={styles.valorEditavel}>
              <Text style={styles.valor}>{pet === null ? '' : pet.nome}</Text>
              <MaterialIcons name="edit" size={18} color={CORES.ameixaSuave} />
            </View>
          </Pressable>
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

        <Text style={styles.grupo}>Lembretes</Text>
        <View style={styles.cartao}>
          {/* Desligados, a linha vira um atalho para as configurações: o
              app não consegue mais pedir a permissão depois que o usuário
              negou, só o próprio usuário pode liberar lá. */}
          <Pressable
            style={({ pressed }) => [
              styles.linha,
              pressed ? styles.linhaPressionada : null,
            ]}
            onPress={() => Linking.openSettings()}
            disabled={lembretesLigados}
          >
            <Text style={styles.rotulo}>Avisar na hora de cada dose</Text>
            <View style={styles.valorEditavel}>
              <Text
                style={[
                  styles.valor,
                  lembretesLigados ? styles.ligado : styles.desligado,
                ]}
              >
                {lembretesLigados ? 'Ligados' : 'Desligados'}
              </Text>
              {lembretesLigados ? null : (
                <MaterialIcons name="open-in-new" size={18} color={CORES.framboesa} />
              )}
            </View>
          </Pressable>
        </View>
        {lembretesLigados ? null : (
          <Text style={styles.ajuda}>
            Toque para liberar as notificações nas configurações do aparelho.
          </Text>
        )}

        <View style={styles.sair}>
          <Botao
            titulo="Sair da conta"
            variante="secundario"
            aoPressionar={confirmarSaida}
          />
        </View>
      </ScrollView>

      <JanelaNomeDoPet
        visivel={janelaAberta}
        nomeAtual={pet === null ? '' : pet.nome}
        aoFechar={() => setJanelaAberta(false)}
        aoSalvar={renomearPet}
      />
    </>
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
  linhaPressionada: {
    opacity: 0.6,
  },
  valorEditavel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  ligado: {
    color: CORES.salvia,
  },
  desligado: {
    color: CORES.framboesa,
  },
  ajuda: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
    marginTop: -16,
    marginBottom: 24,
  },
  sair: {
    marginTop: 8,
  },
});
