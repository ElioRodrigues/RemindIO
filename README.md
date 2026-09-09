# RemindIO

App mobile de lembrete de medicamentos com um pet virtual. O usuário cadastra os
remédios e os horários; cada dose confirmada no horário mantém o pet saudável, e
as doses esquecidas o deixam abatido ou doente.

Trabalho da 1ª avaliação da disciplina de Programação Mobile.

## Telas

| Tela | Arquivo | O que faz |
|---|---|---|
| Login | `src/app/index.tsx` | autenticação por e-mail e senha (Formik + Yup) |
| Cadastro | `src/app/cadastro.tsx` | cria a conta e o nome do pet |
| Início | `src/app/(tabs)/inicio.tsx` | pet, barra de saúde e as doses de hoje para confirmar |
| Remédios | `src/app/(tabs)/remedios/index.tsx` | lista dos remédios cadastrados (FlatList) |
| Novo remédio | `src/app/(tabs)/remedios/novo.tsx` | formulário com validação |
| Ajustes | `src/app/(tabs)/ajustes.tsx` | resumo do pet e sair da conta |

A navegação é um **Stack** na raiz (Login → Cadastro → app) e **Bottom Tabs**
dentro do app, em `src/app/(tabs)/_layout.tsx`.

## Como rodar

Precisa de Node 18+ e do app **Expo Go** no celular (ou de um emulador Android).

```bash
npm install
npx expo start
```

Leia o QR Code com o Expo Go, ou aperte `a` no terminal para abrir no emulador
Android.

## Como o app guarda os dados

Tudo em **AsyncStorage**, com as chaves prefixadas por `@remindio:`. Nenhuma
tela chama o AsyncStorage direto — todo acesso passa por
`src/services/storage.ts`.

| Chave | Conteúdo |
|---|---|
| `@remindio:usuarios` | as contas criadas no Cadastro |
| `@remindio:sessao` | e-mail de quem está logado |
| `@remindio:remedios:<email>` | os remédios daquela conta |
| `@remindio:tomadas:<email>` | as doses já confirmadas |
| `@remindio:pet:<email>` | o nome do pet |

As três últimas chaves levam o e-mail no fim, senão os dados de uma conta
apareceriam na outra.

> A senha é gravada em texto puro. Isso **não é seguro** e não se faz em app
> real — em produção o certo seria guardar um hash e validar num backend. Aqui
> ficou assim porque o trabalho não tem servidor.

## Como a saúde do pet é calculada

A saúde **não é guardada**: `src/services/pet.ts` recalcula a partir do
histórico de doses toda vez que a tela abre. Assim a mesma dose nunca é
descontada duas vezes, e o pet reage no instante em que um horário vence sem
confirmação.

Entram na conta as doses de ontem e as de hoje que já venceram (o horário mais
uma hora de tolerância):

| Situação da dose | Custo |
|---|---|
| confirmada no horário | 0 |
| confirmada com mais de 1h de atraso | −5 |
| venceu e não foi confirmada | −10 |

`saúde = 100 − (soma dos custos)`, com piso em 0. O desenho do pet vem dessa
mesma nota: `saudavel.png` acima de 60, `abatido.png` entre 30 e 60,
`doente.png` abaixo de 30.

## Estrutura de pastas

```
src/
  app/          rotas do expo-router (uma tela por arquivo)
  components/   Botao, CampoTexto, Cabecalho, CardRemedio, BarraSaude
  services/     storage.ts, datas.ts, pet.ts
  constants/    cores.ts — a paleta em um lugar só
  types/        Usuario, Remedio, Tomada, Pet
```

## Bibliotecas

- **expo-router** — navegação (Stack + Bottom Tabs)
- **formik** — estado dos formulários
- **yup** — regras de validação dos formulários
- **@react-native-async-storage/async-storage** — persistência no aparelho
- **react-native-progress** — biblioteca externa, usada só na barra de saúde
- **@expo/vector-icons** — ícones das tabs

Sem Redux, Zustand, Context API ou biblioteca de CSS: o estado é `useState` e o
estilo é `StyleSheet.create`.
