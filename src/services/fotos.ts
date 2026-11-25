import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';
import { supabase } from './supabase';

// De onde a foto vem: a câmera do aparelho ou as fotos que já estão nele.
export type OrigemDaFoto = 'camera' | 'galeria';

// Bucket do Storage onde ficam as fotos (criado no supabase/schema.sql).
const BUCKET_DAS_FOTOS = 'fotos';

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
// apagar. Quem envia para o servidor é a guardarFoto, na hora de salvar.
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

// O campo foto pode ser "file:///..." (acabou de tirar, ainda não salvou)
// ou "<id do usuário>/123.jpg" (o caminho no Storage, que vai para o banco).
function estaSoNoAparelho(foto: string): boolean {
  return foto.startsWith('file:') || foto.startsWith('content:');
}

// Id de quem está logado (da sessão salva no aparelho).
async function idDoUsuario(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? '';
}

// Envia a foto e devolve o caminho no Storage. Só é chamada ao salvar o
// remédio, então foto de cadastro desistido não vai para o servidor.
export async function guardarFoto(foto: string): Promise<string> {
  // Sem foto, ou foto que já está no Storage (editou sem trocar).
  if (foto === '' || !estaSoNoAparelho(foto)) {
    return foto;
  }

  // Uma pasta por usuário; as regras do Storage só liberam a própria pasta.
  const caminho = (await idDoUsuario()) + '/' + Date.now() + '.jpg';

  // O upload envia os bytes do arquivo.
  const bytes = await new File(foto).bytes();

  const { error } = await supabase.storage
    .from(BUCKET_DAS_FOTOS)
    .upload(caminho, bytes, { contentType: 'image/jpeg' });

  if (error) {
    throw error;
  }

  return caminho;
}

// Usada ao trocar ou remover a foto e ao excluir o remédio. Não lança
// erro: se falhar, só sobra um arquivo no servidor.
export async function apagarFoto(foto: string) {
  if (foto === '' || estaSoNoAparelho(foto)) {
    return;
  }

  const { error } = await supabase.storage.from(BUCKET_DAS_FOTOS).remove([foto]);

  if (error) {
    console.log('Erro ao apagar foto', error);
  }

  linksJaGerados.delete(foto);
}

// Primeira etapa de excluir a conta. O Storage não apaga pasta, então
// lista os arquivos e apaga todos.
export async function apagarTodasAsFotos() {
  const pasta = await idDoUsuario();

  const { data, error } = await supabase.storage
    .from(BUCKET_DAS_FOTOS)
    .list(pasta, { limit: 1000 });

  if (error) {
    throw error;
  }

  if (data.length === 0) {
    return;
  }

  const caminhos = data.map((arquivo) => pasta + '/' + arquivo.name);
  const resposta = await supabase.storage.from(BUCKET_DAS_FOTOS).remove(caminhos);

  if (resposta.error) {
    throw resposta.error;
  }
}

// O bucket é privado, então a foto abre por um link assinado que vence.
const VALIDADE_DO_LINK_EM_SEGUNDOS = 60 * 60;

// Links já gerados (caminho -> link), para não pedir de novo a cada tela.
const linksJaGerados = new Map<string, { link: string; venceEm: number }>();

// Endereço que o Image consegue abrir.
export async function enderecoDaFoto(foto: string): Promise<string> {
  // Ainda no aparelho: o endereço já serve.
  if (estaSoNoAparelho(foto)) {
    return foto;
  }

  const guardado = linksJaGerados.get(foto);

  // Reaproveita se faltam mais de 5 minutos para vencer.
  if (guardado !== undefined && guardado.venceEm - Date.now() > 5 * 60 * 1000) {
    return guardado.link;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_DAS_FOTOS)
    .createSignedUrl(foto, VALIDADE_DO_LINK_EM_SEGUNDOS);

  if (error) {
    throw error;
  }

  linksJaGerados.set(foto, {
    link: data.signedUrl,
    venceEm: Date.now() + VALIDADE_DO_LINK_EM_SEGUNDOS * 1000,
  });

  return data.signedUrl;
}
