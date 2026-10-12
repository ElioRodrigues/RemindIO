import { router, useLocalSearchParams } from 'expo-router';
import { Platform, ToastAndroid } from 'react-native';
import {
  FormularioRemedio,
  RemedioDoFormulario,
} from '../../../components/FormularioRemedio';
import { guardarFoto } from '../../../services/fotos';
import { atualizarLembretes } from '../../../services/lembretes';
import { salvarRemedio } from '../../../services/storage';

export default function NovoRemedio() {
  // Quem abriu pela tela Hoje (o botão da cartela vazia) chega com
  // ?origem=hoje no endereço. Quem abriu pela lista não traz nada.
  const { origem } = useLocalSearchParams<{ origem?: string }>();

  async function cadastrar(dados: RemedioDoFormulario) {
    await salvarRemedio({
      // A hora atual em milissegundos serve como identificador único, e
      // também diz ao pet desde quando o remédio existe.
      id: String(Date.now()),
      // Os três pontinhos copiam nome, dosagem, horários, intervalo e
      // observação que vieram do formulário.
      ...dados,
      // Escrito depois do ...dados, a foto daqui vale mais que a de lá:
      // troca o endereço temporário da câmera pelo da pasta do app.
      foto: guardarFoto(dados.foto ?? ''),
    });

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
