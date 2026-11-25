import { router, useLocalSearchParams } from 'expo-router';
import { Platform, ToastAndroid } from 'react-native';
import {
  FormularioRemedio,
  RemedioDoFormulario,
} from '../../../components/FormularioRemedio';
import { avisarErro } from '../../../services/erros';
import { guardarFoto } from '../../../services/fotos';
import { atualizarLembretes } from '../../../services/lembretes';
import { salvarRemedio } from '../../../services/storage';

export default function NovoRemedio() {
  // Quem abriu pela tela Hoje (o botão da cartela vazia) chega com
  // ?origem=hoje no endereço. Quem abriu pela lista não traz nada.
  const { origem } = useLocalSearchParams<{ origem?: string }>();

  async function cadastrar(dados: RemedioDoFormulario) {
    // try/catch: sem internet, o envio falha. O formulário continua aberto
    // com tudo preenchido, e a pessoa pode tentar de novo.
    try {
      // Primeiro a foto vai para o Storage; o remédio guarda o caminho dela.
      const foto = await guardarFoto(dados.foto ?? '');

      await salvarRemedio({
        // A hora atual em milissegundos serve como identificador único, e
        // também diz ao pet desde quando o remédio existe.
        id: String(Date.now()),
        // Os três pontinhos copiam nome, dosagem, horários, intervalo e
        // observação que vieram do formulário.
        ...dados,
        // Escrito depois do ...dados, a foto daqui vale mais que a de lá:
        // troca o endereço temporário da câmera pelo caminho no Storage.
        foto: foto,
      });
    } catch (erro) {
      avisarErro('Não deu para cadastrar', erro);
      return;
    }

    // O remédio novo passa a ter lembretes nos horários dele.
    await atualizarLembretes();

    if (Platform.OS === 'android') {
      ToastAndroid.show(dados.nome + ' cadastrado', ToastAndroid.SHORT);
    }

    // back fecha o formulário e deixa a lista de remédios no topo da aba.
    router.back();

    // Quem começou na tela Hoje volta para ela, para ver a cartela já com o
    // remédio novo. Sem o back antes, o formulário ficaria aberto na aba
    // Remédios, esperando a próxima visita.
    if (origem === 'hoje') {
      router.navigate('/inicio');
    }
  }

  // Sem remedio, o formulário abre vazio.
  return (
    <FormularioRemedio tituloDoBotao="Cadastrar remédio" aoSalvar={cadastrar} />
  );
}
