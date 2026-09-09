import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, Remedio, Tomada, Usuario } from '../types';

// Estas duas valem para o app inteiro.
const CHAVE_USUARIOS = '@remindio:usuarios';
const CHAVE_SESSAO = '@remindio:sessao';

// Estas três são o começo da chave: o e-mail de quem está logado é colado
// no fim, para os remédios de um usuário não aparecerem na conta do outro.
const INICIO_DA_CHAVE_REMEDIOS = '@remindio:remedios';
const INICIO_DA_CHAVE_TOMADAS = '@remindio:tomadas';
const INICIO_DA_CHAVE_PET = '@remindio:pet';

// Monta a chave do usuário logado, por exemplo:
// '@remindio:remedios' vira '@remindio:remedios:elio@satya.com.br'
async function chaveDoUsuarioLogado(inicioDaChave: string): Promise<string> {
  const email = await lerSessao();

  if (email === null) {
    return inicioDaChave + ':sem-usuario';
  }

  return inicioDaChave + ':' + email;
}

export async function salvarUsuario(usuario: Usuario): Promise<void> {
  try {
    const lista = await buscarListaDeUsuarios();
    lista.push(usuario);
    await AsyncStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
  } catch (erro) {
    console.log('Erro ao salvar usuário', erro);
  }
}

export async function buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
  try {
    const lista = await buscarListaDeUsuarios();
    let encontrado: Usuario | null = null;

    for (let i = 0; i < lista.length; i++) {
      if (lista[i].email === email) {
        encontrado = lista[i];
      }
    }

    return encontrado;
  } catch (erro) {
    console.log('Erro ao buscar usuário', erro);
    return null;
  }
}

export async function salvarSessao(email: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_SESSAO, email);
  } catch (erro) {
    console.log('Erro ao salvar sessão', erro);
  }
}

export async function lerSessao(): Promise<string | null> {
  try {
    const email = await AsyncStorage.getItem(CHAVE_SESSAO);
    return email;
  } catch (erro) {
    console.log('Erro ao ler sessão', erro);
    return null;
  }
}

export async function limparSessao(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE_SESSAO);
  } catch (erro) {
    console.log('Erro ao limpar sessão', erro);
  }
}

export async function listarRemedios(): Promise<Remedio[]> {
  try {
    const chave = await chaveDoUsuarioLogado(INICIO_DA_CHAVE_REMEDIOS);
    const texto = await AsyncStorage.getItem(chave);
    if (!texto) {
      return [];
    }
    const lista: Remedio[] = JSON.parse(texto);
    return lista;
  } catch (erro) {
    console.log('Erro ao listar remédios', erro);
    return [];
  }
}

export async function salvarRemedio(remedio: Remedio): Promise<void> {
  try {
    const chave = await chaveDoUsuarioLogado(INICIO_DA_CHAVE_REMEDIOS);
    const lista = await listarRemedios();
    lista.push(remedio);
    await AsyncStorage.setItem(chave, JSON.stringify(lista));
  } catch (erro) {
    console.log('Erro ao salvar remédio', erro);
  }
}

export async function listarTomadas(): Promise<Tomada[]> {
  try {
    const chave = await chaveDoUsuarioLogado(INICIO_DA_CHAVE_TOMADAS);
    const texto = await AsyncStorage.getItem(chave);
    if (!texto) {
      return [];
    }
    const lista: Tomada[] = JSON.parse(texto);
    return lista;
  } catch (erro) {
    console.log('Erro ao listar tomadas', erro);
    return [];
  }
}

export async function registrarTomada(tomada: Tomada): Promise<void> {
  try {
    const chave = await chaveDoUsuarioLogado(INICIO_DA_CHAVE_TOMADAS);
    const lista = await listarTomadas();
    lista.push(tomada);
    await AsyncStorage.setItem(chave, JSON.stringify(lista));
  } catch (erro) {
    console.log('Erro ao registrar tomada', erro);
  }
}

export async function lerPet(): Promise<Pet | null> {
  try {
    const chave = await chaveDoUsuarioLogado(INICIO_DA_CHAVE_PET);
    const texto = await AsyncStorage.getItem(chave);
    if (!texto) {
      return null;
    }
    const pet: Pet = JSON.parse(texto);
    return pet;
  } catch (erro) {
    console.log('Erro ao ler pet', erro);
    return null;
  }
}

export async function salvarPet(pet: Pet): Promise<void> {
  try {
    const chave = await chaveDoUsuarioLogado(INICIO_DA_CHAVE_PET);
    await AsyncStorage.setItem(chave, JSON.stringify(pet));
  } catch (erro) {
    console.log('Erro ao salvar pet', erro);
  }
}

// Função só deste arquivo: as telas não precisam montar a lista de usuários.
async function buscarListaDeUsuarios(): Promise<Usuario[]> {
  const texto = await AsyncStorage.getItem(CHAVE_USUARIOS);
  if (!texto) {
    return [];
  }
  const lista: Usuario[] = JSON.parse(texto);
  return lista;
}
