import { Pet, Remedio, Tomada } from '../types';
import { supabase } from './supabase';

// Todos os dados do app passam por aqui. Antes era AsyncStorage, agora são
// as tabelas do Supabase; as telas chamam as mesmas funções de antes.
// Não precisa filtrar por usuário: o RLS do banco (supabase/schema.sql) só
// devolve as linhas de quem está logado.
// Se o servidor falhar, a função lança o erro e a tela mostra o aviso.

// Conversão entre o app e o banco: no TypeScript é camelCase
// (intervaloEmHoras), no Postgres é snake_case (intervalo_em_horas).

// O formato de uma linha da tabela remedios, como o Supabase devolve.
interface LinhaDeRemedio {
  id: string;
  nome: string;
  dosagem: string;
  horarios: string[];
  intervalo_em_horas: number;
  observacao: string;
  foto: string;
}

interface LinhaDeTomada {
  remedio_id: string;
  horario: string;
  data: string;
  atrasada: boolean;
}

function linhaParaRemedio(linha: LinhaDeRemedio): Remedio {
  return {
    id: linha.id,
    nome: linha.nome,
    dosagem: linha.dosagem,
    horarios: linha.horarios,
    intervaloEmHoras: linha.intervalo_em_horas,
    observacao: linha.observacao,
    foto: linha.foto,
  };
}

function remedioParaLinha(remedio: Remedio): LinhaDeRemedio {
  return {
    id: remedio.id,
    nome: remedio.nome,
    dosagem: remedio.dosagem,
    horarios: remedio.horarios,
    intervalo_em_horas: remedio.intervaloEmHoras,
    observacao: remedio.observacao,
    foto: remedio.foto ?? '',
  };
}

function linhaParaTomada(linha: LinhaDeTomada): Tomada {
  return {
    remedioId: linha.remedio_id,
    horario: linha.horario,
    data: linha.data,
    atrasada: linha.atrasada,
  };
}

// Remédios (o CRUD)
// Toda chamada do supabase-js devolve { data, error }. Se veio error,
// lança; se não, usa o data.

// READ: todos os remédios da conta, do mais antigo para o mais novo
// (a mesma ordem em que eram guardados na lista do AsyncStorage).
export async function listarRemedios(): Promise<Remedio[]> {
  const { data, error } = await supabase
    .from('remedios')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(linhaParaRemedio);
}

// READ de um só. maybeSingle devolve null em vez de erro quando não acha
// (o remédio pode ter sido excluído e a rota ficado para trás).
export async function buscarRemedioPorId(id: string): Promise<Remedio | null> {
  const { data, error } = await supabase
    .from('remedios')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data === null ? null : linhaParaRemedio(data);
}

// CREATE
export async function salvarRemedio(remedio: Remedio): Promise<void> {
  const { error } = await supabase
    .from('remedios')
    .insert(remedioParaLinha(remedio));

  if (error) {
    throw error;
  }
}

// UPDATE: troca os campos do remédio que tem o mesmo id. O id não muda:
// ele é o instante do cadastro, e o pet usa isso para saber desde quando o
// remédio existe.
export async function atualizarRemedio(remedioEditado: Remedio): Promise<void> {
  const { error } = await supabase
    .from('remedios')
    .update(remedioParaLinha(remedioEditado))
    .eq('id', remedioEditado.id);

  if (error) {
    throw error;
  }
}

// DELETE. As tomadas desse remédio NÃO são apagadas: elas são o histórico
// do que já aconteceu, e o histórico não deve mudar porque o tratamento
// acabou.
export async function excluirRemedio(id: string): Promise<void> {
  const { error } = await supabase.from('remedios').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

// Tomadas (doses confirmadas)

export async function listarTomadas(): Promise<Tomada[]> {
  const { data, error } = await supabase.from('tomadas').select('*');

  if (error) {
    throw error;
  }

  return data.map(linhaParaTomada);
}

export async function registrarTomada(tomada: Tomada): Promise<void> {
  const { error } = await supabase.from('tomadas').insert({
    remedio_id: tomada.remedioId,
    horario: tomada.horario,
    data: tomada.data,
    atrasada: tomada.atrasada,
  });

  if (error) {
    throw error;
  }
}

// Apaga a confirmação de uma dose: é o "Desfazer" de quem tocou em "Tomei"
// por engano. A dose é achada pelos três campos que a identificam.
export async function removerTomada(
  remedioId: string,
  horario: string,
  data: string
): Promise<void> {
  const { error } = await supabase
    .from('tomadas')
    .delete()
    .eq('remedio_id', remedioId)
    .eq('horario', horario)
    .eq('data', data);

  if (error) {
    throw error;
  }
}

// Pet: o nome dele fica na tabela perfis, criada no cadastro.

export async function lerPet(): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('perfis')
    .select('nome_do_pet')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data === null ? null : { nome: data.nome_do_pet };
}

export async function salvarPet(pet: Pet): Promise<void> {
  // O Supabase não aceita update sem filtro, então filtramos pelo id de
  // quem está logado (getSession lê a sessão salva, sem ir à internet).
  const { data: sessao } = await supabase.auth.getSession();
  const id = sessao.session?.user.id ?? '';

  const { error } = await supabase
    .from('perfis')
    .update({ nome_do_pet: pet.nome })
    .eq('id', id);

  if (error) {
    throw error;
  }
}
