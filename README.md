# RemindIO

App mobile de lembrete de medicamentos com um pet virtual. O usuário cadastra os
remédios e os horários, recebe um aviso na hora de cada dose e confirma no app;
cada dose confirmada no horário mantém o pet saudável, e as doses esquecidas o
deixam abatido ou doente.

Trabalho da disciplina de Programação Mobile (1ª e 2ª avaliações).

## Telas

| Tela | Arquivo | O que faz |
|---|---|---|
| Login | `src/app/index.tsx` | entrar com e-mail e senha (Formik + Yup); lembra a sessão |
| Cadastro | `src/app/cadastro.tsx` | cria a conta e o pet, e já entra logado |
| Hoje | `src/app/(tabs)/inicio.tsx` | o pet, a barra de saúde e a cartela de doses do dia (confirmar e desfazer) |
| Remédios | `src/app/(tabs)/remedios/index.tsx` | lista dos remédios, com a foto de cada um (FlatList) |
| Detalhe | `src/app/(tabs)/remedios/[id].tsx` | horários de hoje, foto ampliada, editar e excluir |
| Novo remédio | `src/app/(tabs)/remedios/novo.tsx` | formulário com foto, horários fixos ou "a cada X horas" |
| Editar remédio | `src/app/(tabs)/remedios/editar/[id].tsx` | o mesmo formulário, já preenchido |
| Histórico | `src/app/(tabs)/historico.tsx` | % de doses tomadas por dia, adesão dos últimos 7 dias e sequência (FlatList) |
| Ajustes | `src/app/(tabs)/ajustes.tsx` | conta, pet (renomear), lembretes ligados ou não, sair |

## Navegação

Três tipos, todos com **Expo Router** (as rotas saem das pastas de `src/app`):

- **Stack** na raiz: Login → Cadastro → app (`src/app/_layout.tsx`)
- **Bottom Tabs** dentro do app: Hoje, Remédios, Histórico, Ajustes
  (`src/app/(tabs)/_layout.tsx`)
- **Stack** dentro da aba Remédios, com **rotas dinâmicas**: `remedios/[id]` e
  `remedios/editar/[id]` (`src/app/(tabs)/remedios/_layout.tsx`)

## Recursos nativos

| Recurso | Biblioteca | Onde |
|---|---|---|
| Câmera e galeria | `expo-image-picker` | foto da caixa ou da receita (`src/services/fotos.ts`) |
| Arquivos do aparelho | `expo-file-system` | a foto é copiada para a pasta do app |
| Notificações locais | `expo-notifications` | lembrete diário de cada dose, mesmo com o app fechado (`src/services/lembretes.ts`) |

## Como rodar

Precisa de Node 18+ e do app **Expo Go** no celular (ou de um emulador Android).

```bash
npm install
npx expo start
```

Leia o QR Code com o Expo Go, ou aperte `a` no terminal para abrir no emulador
Android.

No Expo Go as permissões (câmera e notificações) aparecem em nome do "Expo Go",
e os lembretes podem chegar alguns minutos depois do horário: o Android trata o
alarme como inexato para economizar bateria. Num app compilado, a permissão
`SCHEDULE_EXACT_ALARM` (já declarada no `app.json`) deixa o alarme exato.

## Como o app guarda os dados

Tudo no aparelho, em **AsyncStorage**, com as chaves prefixadas por
`@remindio:`. Nenhuma tela chama o AsyncStorage direto: todo acesso passa por
`src/services/storage.ts`.

| Chave | Conteúdo |
|---|---|
| `@remindio:usuarios` | as contas criadas no Cadastro |
| `@remindio:sessao` | e-mail de quem está logado |
| `@remindio:remedios:<email>` | os remédios daquela conta (com o endereço da foto) |
| `@remindio:tomadas:<email>` | as doses já confirmadas |
| `@remindio:pet:<email>` | o nome do pet |

As três últimas chaves levam o e-mail no fim, senão os dados de uma conta
apareceriam na outra. As **fotos** não ficam no AsyncStorage: são arquivos na
pasta `fotos` do app, e o remédio guarda só o endereço.

A saúde do pet, as doses de hoje, o histórico e os lembretes **não são
guardados**: são recalculados a partir dos remédios e das tomadas sempre que
precisam. Assim nunca existem duas versões da mesma informação.

> A senha é gravada em texto puro. Isso **não é seguro** e não se faz em app
> real: em produção o certo seria guardar um hash e validar num backend. Aqui
> ficou assim porque o trabalho não tem servidor.

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

## Estrutura de pastas

```
src/
  app/          rotas do Expo Router (uma tela por arquivo)
  components/   peças de tela: Botao, CampoTexto, CampoFoto, FotoDoRemedio,
                CardRemedio, FormularioRemedio, BolhaDose, BarraSaude,
                DiaDoHistorico, JanelaNomeDoPet
  services/     regras e dados: storage, pet, doses, datas, historico,
                fotos, lembretes
  constants/    cores, fontes e o cabeçalho comum da navegação
  types/        Usuario, Remedio, Tomada, Pet, Dose, ResumoDoDia...
```

## Bibliotecas

- **expo-router** — navegação (Stack, Bottom Tabs e rotas dinâmicas)
- **formik** e **yup** — estado e regras de validação dos formulários
- **@react-native-async-storage/async-storage** — dados no aparelho
- **expo-image-picker** e **expo-file-system** — foto do remédio
- **expo-notifications** — lembretes
- **expo-font** com **Baloo 2** e **Atkinson Hyperlegible** — tipografia
- **react-native-progress** — a barra de saúde do pet
- **@expo/vector-icons** — ícones
- **@react-navigation/elements** — só o `useHeaderHeight`, para o teclado não
  cobrir os formulários

Sem Redux, Zustand, Context API ou biblioteca de componentes prontos: o estado
é `useState` e o estilo é `StyleSheet.create`.

## Para estudar o código

O `ESTUDO.md` (fora do repositório) explica cada parte, cada função e as
perguntas prováveis da apresentação.
