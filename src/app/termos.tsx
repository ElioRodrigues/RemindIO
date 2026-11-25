import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';

// Onde fica o projeto do Supabase. É a região escolhida ao criar o projeto
// no painel; se mudar lá, muda aqui.
const REGIAO_DO_SERVIDOR = 'Oregon, Estados Unidos (região us-west-2)';

// Cada bloco do termo: um título e o texto. Ficam numa lista para a tela
// desenhar todos do mesmo jeito com um map, sem repetir o mesmo JSX sete vezes.
const SECOES = [
  {
    titulo: 'Quais dados o RemindIO guarda',
    texto:
      'Seu nome, seu e-mail e sua senha; o nome do seu pet; os remédios que você cadastra (nome, dose, horários, observação e a foto da caixa ou da receita, se você tirar uma); e cada dose que você confirma ou desfaz.',
  },
  {
    titulo: 'Onde eles ficam',
    texto:
      'Num banco de dados do Supabase, um serviço de nuvem, em servidores em ' +
      REGIAO_DO_SERVIDOR +
      '. Como o servidor fica fora do Brasil, ao aceitar este termo você também concorda com essa transferência internacional dos dados (LGPD, art. 33). A senha é guardada embaralhada (hash): nem o app nem quem cuida do servidor consegue lê-la. As fotos ficam numa área privada e só abrem com um link temporário, gerado para a sua conta.',
  },
  {
    titulo: 'Por que o app precisa deles',
    texto:
      'Só para funcionar: montar a cartela do dia, avisar na hora de cada dose, calcular a saúde do pet e mostrar seu histórico. Os dados não são vendidos, não são usados para propaganda e não são compartilhados com ninguém.',
  },
  {
    titulo: 'Dados de saúde',
    texto:
      'Os remédios que você toma são dados de saúde, que a LGPD (Lei 13.709/2018) trata como sensíveis. Por isso o app só cria sua conta depois que você aceita este termo.',
  },
  {
    titulo: 'Quem vê seus dados',
    texto:
      'Só você, entrando com seu e-mail e sua senha. O banco tem regras que entregam cada remédio, dose e foto apenas para a conta dona deles.',
  },
  {
    titulo: 'Seus direitos',
    texto:
      'Você pode ver e corrigir seus dados a qualquer momento no próprio app. E pode apagar tudo: em Ajustes, "Excluir minha conta" remove do servidor sua conta, seus remédios, suas doses e suas fotos, de forma definitiva.',
  },
  {
    titulo: 'Lembretes',
    texto:
      'Os avisos de dose são agendados no próprio celular e não passam pelo servidor. Ao sair da conta ou excluí-la, eles são cancelados.',
  },
];

// A tela do termo. Abre a partir do Cadastro (antes de aceitar) e dos
// Ajustes (para reler depois).
export default function Termos() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.intro}>
        Este termo explica, sem juridiquês, o que o RemindIO guarda sobre você e
        onde.
      </Text>

      {SECOES.map((secao) => (
        // key: o React precisa de um identificador para cada item de uma
        // lista. O título não se repete, então serve.
        <View key={secao.titulo} style={styles.cartao}>
          <Text style={styles.titulo}>{secao.titulo}</Text>
          <Text style={styles.texto}>{secao.texto}</Text>
        </View>
      ))}
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
    gap: 12,
  },
  intro: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixaSuave,
    marginBottom: 4,
  },
  cartao: {
    backgroundColor: CORES.branco,
    borderRadius: 20,
    padding: 16,
  },
  titulo: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    color: CORES.ameixa,
    marginBottom: 4,
  },
  texto: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    lineHeight: 24,
    color: CORES.ameixa,
  },
});
