-- RemindIO: estrutura do banco no Supabase.
-- Como usar: no painel do Supabase, abrir "SQL Editor", colar este arquivo
-- inteiro e clicar em "Run". Pode rodar de novo sem quebrar nada.

-- ---------------------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------------------

-- Os dados de cada conta que não são login. O e-mail e a senha ficam na
-- tabela auth.users, que é do próprio Supabase: o app nunca vê a senha.
-- "on delete cascade": se a conta for apagada, o perfil vai junto.
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  nome_do_pet text not null default 'Pipo',
  -- Quando a pessoa aceitou o termo de privacidade (LGPD).
  aceitou_termos_em timestamptz not null default now()
);

-- Um remédio por linha. O id é o instante do cadastro (Date.now()), como
-- era no AsyncStorage: o pet usa isso para saber desde quando ele existe.
-- A chave é a dupla (usuario_id, id), para dois usuários nunca colidirem.
create table if not exists public.remedios (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  nome text not null,
  dosagem text not null,
  horarios text[] not null,
  intervalo_em_horas integer not null default 0,
  observacao text not null default '',
  -- Caminho da foto no Storage, por exemplo "<usuario_id>/1732540000000.jpg".
  foto text not null default '',
  primary key (usuario_id, id)
);

-- Uma dose confirmada por linha. Não tem ligação (foreign key) com
-- remedios de propósito: excluir um remédio não apaga o histórico dele.
-- A chave impede confirmar a mesma dose duas vezes.
create table if not exists public.tomadas (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  remedio_id text not null,
  horario text not null,
  data text not null,
  atrasada boolean not null default false,
  primary key (usuario_id, remedio_id, horario, data)
);

-- ---------------------------------------------------------------------------
-- 2. Segurança: cada usuário só enxerga as próprias linhas (RLS)
-- ---------------------------------------------------------------------------
-- A chave que vai dentro do app é pública. Quem protege os dados são estas
-- regras: o banco compara o dono da linha com auth.uid(), o id de quem fez
-- o pedido, tirado do token de login.

-- Primeiro a permissão de usar as tabelas (grant), dada só a quem está
-- logado (authenticated). Projetos novos do Supabase não dão isso sozinhos.
-- O grant diz QUAIS operações; o RLS logo abaixo diz EM QUAIS LINHAS.
-- O perfil não tem insert nem delete: nasce pelo gatilho e morre com a conta.
grant select, update on public.perfis to authenticated;
grant select, insert, update, delete on public.remedios to authenticated;
grant select, insert, update, delete on public.tomadas to authenticated;

alter table public.perfis enable row level security;
alter table public.remedios enable row level security;
alter table public.tomadas enable row level security;

drop policy if exists "dono le o perfil" on public.perfis;
create policy "dono le o perfil" on public.perfis
  for select to authenticated using (id = auth.uid());

drop policy if exists "dono altera o perfil" on public.perfis;
create policy "dono altera o perfil" on public.perfis
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "dono mexe nos remedios" on public.remedios;
create policy "dono mexe nos remedios" on public.remedios
  for all to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

drop policy if exists "dono mexe nas tomadas" on public.tomadas;
create policy "dono mexe nas tomadas" on public.tomadas
  for all to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Perfil criado junto com a conta
-- ---------------------------------------------------------------------------
-- O app manda nome e nome do pet como "metadados" no cadastro. Este gatilho
-- roda dentro do banco logo depois que a conta nasce e cria o perfil.
-- security definer: roda com permissão do dono do banco, porque nesse
-- instante ainda não existe usuário logado para passar pelo RLS.

create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome, nome_do_pet)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    coalesce(new.raw_user_meta_data ->> 'nome_do_pet', 'Pipo')
  );
  return new;
end;
$$;

drop trigger if exists ao_criar_conta on auth.users;
create trigger ao_criar_conta
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------------------------------------------------------------------------
-- 4. Excluir a própria conta (LGPD)
-- ---------------------------------------------------------------------------
-- O app não pode apagar de auth.users direto. Esta função pode, e só apaga
-- a conta de quem chamou (auth.uid()). O "on delete cascade" das tabelas
-- leva junto perfil, remédios e tomadas. As fotos o app apaga antes, pelo
-- Storage, porque o Supabase não deixa apagar arquivos por SQL.

create or replace function public.excluir_minha_conta()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Fotos dos remédios (Storage)
-- ---------------------------------------------------------------------------
-- Bucket privado: a foto só abre com um link assinado, que vence sozinho.
-- Cada usuário só mexe na pasta com o próprio id: "<usuario_id>/arquivo.jpg".

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', false)
on conflict (id) do nothing;

drop policy if exists "dono le as fotos" on storage.objects;
create policy "dono le as fotos" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "dono envia fotos" on storage.objects;
create policy "dono envia fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "dono apaga fotos" on storage.objects;
create policy "dono apaga fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
