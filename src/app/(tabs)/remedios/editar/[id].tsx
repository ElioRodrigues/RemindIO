import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ToastAndroid, View } from 'react-native';
import {
  FormularioRemedio,
  RemedioDoFormulario,
} from '../../../../components/FormularioRemedio';
import { CORES } from '../../../../constants/cores';
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
    // A mesma id de antes: é ela que diz qual remédio está sendo trocado.
    await atualizarRemedio({ id: id, ...dados });

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
