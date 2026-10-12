import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ToastAndroid, View } from 'react-native';
import {
  FormularioRemedio,
  RemedioDoFormulario,
} from '../../../../components/FormularioRemedio';
import { CORES } from '../../../../constants/cores';
import { apagarFoto, guardarFoto } from '../../../../services/fotos';
import { atualizarLembretes } from '../../../../services/lembretes';
import { atualizarRemedio, buscarRemedioPorId } from '../../../../services/storage';
import { Remedio } from '../../../../types';

export default function EditarRemedio() {
  // O [id] do nome do arquivo vira um parâmetro da rota: abrir
  // /remedios/editar/1728600000000 entrega id = '1728600000000'.
  const { id } = useLocalSearchParams<{ id: string }>();
  const [remedio, setRemedio] = useState<Remedio | null>(null);

  // useEffect basta: o remédio não muda enquanto esta tela está aberta.
  useEffect(() => {
    async function carregarRemedio() {
      const encontrado = await buscarRemedioPorId(id);
      setRemedio(encontrado);
    }

    carregarRemedio();
  }, [id]);

  async function salvarAlteracoes(dados: RemedioDoFormulario) {
    const fotoNova = guardarFoto(dados.foto ?? '');

    // A mesma id de antes: é ela que diz qual remédio está sendo trocado.
    await atualizarRemedio({ id: id, ...dados, foto: fotoNova });

    // Se a foto foi trocada ou removida, a antiga não é mais de ninguém.
    // Só apaga depois de salvar: se algo der errado antes, o remédio ainda
    // aponta para a foto antiga, e ela precisa continuar existindo.
    const fotoAntiga = remedio !== null && remedio.foto ? remedio.foto : '';
    if (fotoAntiga !== fotoNova) {
      apagarFoto(fotoAntiga);
    }

    // Os horários podem ter mudado: os lembretes acompanham.
    await atualizarLembretes();

    if (Platform.OS === 'android') {
      ToastAndroid.show('Alterações salvas', ToastAndroid.SHORT);
    }

    router.back();
  }

  // O Formik só lê os valores iniciais uma vez, quando aparece. Por isso o
  // formulário só é desenhado depois que o remédio chegou do AsyncStorage;
  // antes disso ele abriria vazio e continuaria vazio.
  if (remedio === null) {
    return <View style={{ flex: 1, backgroundColor: CORES.nevoa }} />;
  }

  return (
    <FormularioRemedio
      remedio={remedio}
      tituloDoBotao="Salvar alterações"
      aoSalvar={salvarAlteracoes}
    />
  );
}
