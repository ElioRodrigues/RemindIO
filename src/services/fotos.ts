import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

// De onde a foto vem: a câmera do aparelho ou as fotos que já estão nele.
export type OrigemDaFoto = 'camera' | 'galeria';

// A pasta das fotos fica dentro da pasta de documentos do app. Só o app
// enxerga essa pasta, e ela só é apagada quando o app é desinstalado.
const PASTA_DAS_FOTOS = new Directory(Paths.document, 'fotos');

// O mesmo corte para as duas origens: quadrado, porque a foto aparece num
// quadrado no card e no detalhe; qualidade 0.6 porque uma caixa de remédio
// não precisa de 5 MB, e o arquivo fica bem menor.
const OPCOES_DA_FOTO: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.6,
};

// Abre a câmera ou a galeria e devolve o endereço (uri) da foto escolhida,
// ou null se o usuário desistiu ou negou a permissão.
// Esse endereço é TEMPORÁRIO: é um arquivo no cache, que o sistema pode
// apagar. Quem guarda de verdade é a guardarFoto, na hora de salvar.
export async function escolherFoto(origem: OrigemDaFoto): Promise<string | null> {
  try {
    let resultado: ImagePicker.ImagePickerResult;

    if (origem === 'camera') {
      // A câmera precisa de permissão: o sistema mostra a janela
      // "Permitir que o RemindIO tire fotos?" na primeira vez.
      const permissao = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissao.granted) {
        avisarPermissaoNegada();
        return null;
      }

      resultado = await ImagePicker.launchCameraAsync(OPCOES_DA_FOTO);
    } else {
      // A galeria não pede permissão: ela abre o seletor de fotos do
      // próprio sistema, e o app só recebe a foto que o usuário escolheu.
      resultado = await ImagePicker.launchImageLibraryAsync(OPCOES_DA_FOTO);
    }

    // canceled é true quando o usuário voltou sem tirar ou escolher foto.
    if (resultado.canceled) {
      return null;
    }

    // assets é uma lista porque a galeria permite escolher várias fotos.
    // Aqui só uma é permitida, então é sempre a primeira.
    return resultado.assets[0].uri;
  } catch (erro) {
    console.log('Erro ao escolher foto', erro);
    return null;
  }
}

// Quando a permissão foi negada, o app não consegue mais pedir de novo:
// o sistema não mostra a janela outra vez. O único jeito é o usuário
// liberar nas configurações, então o aviso já oferece abrir lá.
function avisarPermissaoNegada() {
  Alert.alert(
    'Sem acesso à câmera',
    'Para fotografar a caixa ou a receita, libere a câmera para o RemindIO nas configurações do aparelho.',
    [
      { text: 'Agora não' },
      { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
    ]
  );
}

// true quando a foto já está na pasta do app (ou seja, já foi guardada).
function estaNaPastaDoApp(uri: string): boolean {
  return uri.startsWith(PASTA_DAS_FOTOS.uri);
}

// Copia a foto do cache para a pasta do app e devolve o endereço novo,
// que é o que vai para o AsyncStorage. Recebe '' quando não há foto.
// A cópia só acontece ao salvar o remédio: se o usuário tirar três fotos
// e desistir do cadastro, nenhuma delas ocupa espaço no aparelho.
export function guardarFoto(uri: string): string {
  // Sem foto, ou foto que já foi guardada antes (editar sem trocar a foto):
  // não há nada para copiar.
  if (uri === '' || estaNaPastaDoApp(uri)) {
    return uri;
  }

  try {
    // idempotent: true quer dizer "se a pasta já existe, tudo bem".
    PASTA_DAS_FOTOS.create({ idempotent: true });

    // O nome do arquivo é o instante atual, como o id dos remédios:
    // nunca se repete.
    const destino = new File(PASTA_DAS_FOTOS, Date.now() + '.jpg');
    new File(uri).copy(destino);

    return destino.uri;
  } catch (erro) {
    console.log('Erro ao guardar foto', erro);
    // Sem conseguir copiar, o remédio é salvo sem foto. Guardar o endereço
    // do cache seria pior: a foto sumiria sozinha algum dia.
    return '';
  }
}

// Apaga a foto da pasta do app. Usada ao trocar a foto, ao removê-la e ao
// excluir o remédio, para não sobrar arquivo que ninguém mais usa.
export function apagarFoto(uri: string) {
  // Só apaga o que é nosso: nunca um arquivo fora da pasta do app.
  if (uri === '' || !estaNaPastaDoApp(uri)) {
    return;
  }

  try {
    const arquivo = new File(uri);

    if (arquivo.exists) {
      arquivo.delete();
    }
  } catch (erro) {
    console.log('Erro ao apagar foto', erro);
  }
}
