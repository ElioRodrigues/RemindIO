import { router } from 'expo-router';
import { Platform, ToastAndroid } from 'react-native';
import {
  FormularioRemedio,
  RemedioDoFormulario,
} from '../../../components/FormularioRemedio';
import { salvarRemedio } from '../../../services/storage';

export default function NovoRemedio() {
  async function cadastrar(dados: RemedioDoFormulario) {
    await salvarRemedio({
      // A hora atual em milissegundos serve como identificador único, e
      // também diz ao pet desde quando o remédio existe.
      id: String(Date.now()),
      // Os três pontinhos copiam nome, dosagem, horários, intervalo e
      // observação que vieram do formulário.
      ...dados,
    });

    if (Platform.OS === 'android') {
      ToastAndroid.show(dados.nome + ' cadastrado', ToastAndroid.SHORT);
    }

    router.back();
  }

  // Sem remedio, o formulário abre vazio.
  return (
    <FormularioRemedio tituloDoBotao="Cadastrar remédio" aoSalvar={cadastrar} />
  );
}
