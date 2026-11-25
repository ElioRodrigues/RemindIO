# RemindIO

App mobile de lembrete de medicamentos com um pet virtual. O usuário cadastra os
remédios e os horários, recebe um aviso na hora de cada dose e confirma no app.
Dose confirmada no horário mantém o pet saudável; dose esquecida o deixa abatido
ou doente.

Trabalho da disciplina de Programação Mobile. Na 3ª avaliação os dados saíram do
aparelho e foram para um back-end no **Supabase** (login, banco e fotos).

## Para testar

O back-end já está no ar, então não é preciso configurar nada. Dá para criar uma
conta nova no app ou entrar com a conta de demonstração, que já tem três remédios
e uma semana de histórico:

| E-mail | Senha |
|---|---|
| `professor@remindio.app` | `remindio123` |

O jeito mais rápido é abrir a versão publicada no **Expo Go** (da Play Store
ou da App Store), colando este endereço no campo de URL do Expo Go:

```
exp://u.expo.dev/34553056-3418-4cf8-9711-7e2416bfb8ad/group/e33d49ca-4f76-4b26-be11-efe7f1718d5f
```

Para rodar pelo código, é preciso Node 22 ou mais novo e o Expo Go da loja
(o projeto usa o Expo SDK 58), ou um emulador Android:

```bash
npm install
npx expo start
```

O arquivo `.env` com o endereço do Supabase já vem no repositório.

No Expo Go as permissões de câmera e notificação aparecem em nome do "Expo Go",
e os lembretes podem atrasar alguns minutos, porque o Android trata o alarme
como inexato. O Expo Go 58 também mostra uma engrenagem flutuante no canto da
tela, que é do próprio Expo Go e não do app. Num app compilado a permissão `SCHEDULE_EXACT_ALARM` do
`app.json` resolve isso.

## Telas

| Tela | Arquivo | O que faz |
|---|---|---|
| Login | `src/app/index.tsx` | entrar com e-mail e senha; lembra a sessão |
| Cadastro | `src/app/cadastro.tsx` | cria a conta e o pet; só cria com o termo aceito |
| Termo de privacidade | `src/app/termos.tsx` | quais dados o app guarda, onde e como apagar |
| Hoje | `src/app/(tabs)/inicio.tsx` | o pet, a barra de saúde e a cartela de doses do dia |
| Remédios | `src/app/(tabs)/remedios/index.tsx` | lista dos remédios com foto (FlatList, puxar para atualizar) |
| Detalhe | `src/app/(tabs)/remedios/[id].tsx` | horários de hoje, foto ampliada, editar e excluir |
| Novo remédio | `src/app/(tabs)/remedios/novo.tsx` | formulário com foto, horários fixos ou "a cada X horas" |
| Editar remédio | `src/app/(tabs)/remedios/editar/[id].tsx` | o mesmo formulário, já preenchido |
| Histórico | `src/app/(tabs)/historico.tsx` | % de doses tomadas por dia, adesão dos últimos 7 dias e sequência |
| Ajustes | `src/app/(tabs)/ajustes.tsx` | conta, pet, lembretes, termo, sair e excluir a conta |

## Back-end (Supabase)

| O quê | Onde fica | Código |
|---|---|---|
| Login e cadastro | Supabase Auth (senha com hash, só no servidor) | `src/services/autenticacao.ts` |
| Remédios, doses e perfil | tabelas `remedios`, `tomadas` e `perfis` (Postgres) | `src/services/storage.ts` |
| Fotos dos remédios | bucket privado `fotos` no Storage | `src/services/fotos.ts` |

O CRUD completo é o de remédios: `salvarRemedio`, `listarRemedios` e
`buscarRemedioPorId`, `atualizarRemedio` e `excluirRemedio`.

No aparelho fica só o token de login, guardado no AsyncStorage pelo próprio
`supabase-js`, para o app abrir já logado.

A chave do `.env` é a pública do projeto. Os dados são protegidos pelas regras
de RLS do banco: cada usuário só lê e grava as próprias linhas, e só acessa a
própria pasta de fotos. As fotos abrem por um link assinado que vence em uma
hora.

O banco inteiro (tabelas, permissões, regras de RLS, o gatilho que cria o perfil
no cadastro e a função de excluir a conta) está em `supabase/schema.sql`. Para
montar um projeto novo do zero, basta rodar esse arquivo no SQL Editor do
Supabase, desligar "Confirm email" em Authentication e trocar os valores do
`.env`.

## LGPD

O cadastro só cria a conta depois que a pessoa marca "Li e aceito o termo de
privacidade". O termo diz quais dados são guardados, que ficam num servidor do
Supabase nos Estados Unidos (região us-west-2) e que remédios são dados de
saúde.

Em Ajustes, "Excluir minha conta" apaga as fotos e depois a conta. O
`on delete cascade` das tabelas leva junto o perfil, os remédios e as doses.

## Navegação

Três tipos, todos com **Expo Router** (as rotas saem das pastas de `src/app`):

- **Stack** na raiz: Login → Cadastro → Termo → app (`src/app/_layout.tsx`)
- **Bottom Tabs** dentro do app: Hoje, Remédios, Histórico, Ajustes
  (`src/app/(tabs)/_layout.tsx`)
- **Stack** dentro da aba Remédios, com **rotas dinâmicas**: `remedios/[id]` e
  `remedios/editar/[id]` (`src/app/(tabs)/remedios/_layout.tsx`)

## Recursos nativos

| Recurso | Biblioteca | Onde |
|---|---|---|
| Câmera e galeria | `expo-image-picker` | foto da caixa ou da receita (`src/services/fotos.ts`) |
| Notificações locais | `expo-notifications` | lembrete diário de cada dose, mesmo com o app fechado (`src/services/lembretes.ts`) |

## Como a saúde do pet é calculada

`src/services/pet.ts` soma o custo das doses de ontem e das de hoje que já
venceram (o horário mais uma hora de tolerância):

| Situação da dose | Custo |
|---|---|
| confirmada no horário | 0 |
| confirmada com mais de 1h de atraso | −5 |
| venceu e não foi confirmada | −10 |

`saúde = 100 − (soma dos custos)`, com piso em 0. O desenho do pet vem dessa
mesma nota: `saudavel.png` acima de 60, `abatido.png` entre 30 e 60,
`doente.png` abaixo de 30. Doses de antes do cadastro do remédio não contam.

A saúde, as doses de hoje, o histórico e os lembretes não são guardados no
banco: são recalculados a partir dos remédios e das tomadas.

## Estrutura de pastas

```
src/
  app/          rotas do Expo Router (uma tela por arquivo)
  components/   Botao, CampoTexto, CaixaDeAceite, CampoFoto, FotoDoRemedio,
                CardRemedio, FormularioRemedio, BolhaDose, BarraSaude,
                DiaDoHistorico, JanelaNomeDoPet
  services/     supabase, autenticacao, storage, fotos, erros, pet, doses,
                datas, historico, lembretes
  constants/    cores, fontes e o cabeçalho comum da navegação
  types/        Usuario, Remedio, Tomada, Pet, Dose, ResumoDoDia...
supabase/
  schema.sql    estrutura do banco
```

Nenhuma tela chama o Supabase direto. Os services lançam o erro quando o
servidor falha, e a tela mostra a mensagem com `avisarErro`
(`src/services/erros.ts`), que traduz os erros mais comuns para português.

## Bibliotecas

- **@supabase/supabase-js** e **react-native-url-polyfill**: back-end
- **expo-router**: navegação (Stack, Bottom Tabs e rotas dinâmicas)
- **formik** e **yup**: estado e validação dos formulários
- **@react-native-async-storage/async-storage**: guarda a sessão do Supabase
- **expo-image-picker** e **expo-file-system**: foto do remédio
- **expo-notifications**: lembretes
- **expo-font** com **Baloo 2** e **Atkinson Hyperlegible**: tipografia
- **react-native-progress**: a barra de saúde do pet
- **@expo/vector-icons**: ícones
