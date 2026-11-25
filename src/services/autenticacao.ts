import { Usuario } from '../types';
import { apagarTodasAsFotos } from './fotos';
import { supabase } from './supabase';

// Login, cadastro, sessão e exclusão de conta, pelo Supabase Auth.
// A senha fica só no servidor (com hash); o app recebe um token.

export interface DadosDaContaNova {
  nome: string;
  email: string;
  senha: string;
  nomeDoPet: string;
}

// Se der certo, o supabase-js guarda a sessão sozinho (ver supabase.ts).
export async function entrar(email: string, senha: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha,
  });

  if (error) {
    throw error;
  }
}

// Nome e pet vão em options.data; o gatilho criar_perfil do banco usa
// esses dados para criar o perfil. Devolve false se o projeto exigir
// confirmação de e-mail (aí ainda não há sessão).
export async function criarConta(dados: DadosDaContaNova): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
    options: {
      data: {
        nome: dados.nome,
        nome_do_pet: dados.nomeDoPet,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data.session !== null;
}

// getSession lê a sessão salva no aparelho, sem ir à internet.
export async function haSessao(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

// O usuário logado: id e e-mail vêm da sessão; o nome, da tabela perfis.
export async function buscarUsuarioLogado(): Promise<Usuario | null> {
  const { data: sessao } = await supabase.auth.getSession();

  if (sessao.session === null) {
    return null;
  }

  const usuario = sessao.session.user;

  const { data: perfil, error } = await supabase
    .from('perfis')
    .select('nome')
    .eq('id', usuario.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    id: usuario.id,
    email: usuario.email ?? '',
    nome: perfil === null ? '' : perfil.nome,
  };
}

// Mesmo sem internet a sessão do aparelho é apagada, então não lança erro.
export async function sair(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log('Erro ao sair', error);
  }
}

// LGPD: apaga as fotos (pelo Storage, o SQL não apaga arquivos), depois a
// conta pela função excluir_minha_conta (o cascade leva perfil, remédios e
// tomadas) e por fim a sessão do aparelho.
export async function excluirConta(): Promise<void> {
  await apagarTodasAsFotos();

  // rpc chama uma função criada no banco, pelo nome.
  const { error } = await supabase.rpc('excluir_minha_conta');

  if (error) {
    throw error;
  }

  // local: a conta já não existe no servidor, só limpa o aparelho.
  await supabase.auth.signOut({ scope: 'local' });
}
