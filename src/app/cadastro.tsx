import { router } from 'expo-router';
import { Formik } from 'formik';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
} from 'react-native';
import * as Yup from 'yup';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';
import {
  buscarUsuarioPorEmail,
  salvarPetDaConta,
  salvarUsuario,
} from '../services/storage';

interface DadosDoCadastro {
  nome: string;
  email: string;
  senha: string;
  confirmacao: string;
  nomeDoPet: string;
}

const valoresIniciais: DadosDoCadastro = {
  nome: '',
  email: '',
  senha: '',
  confirmacao: '',
  nomeDoPet: '',
};

const regrasDeValidacao = Yup.object({
  nome: Yup.string().required('Informe seu nome'),
  // trim antes de validar: o teclado do celular costuma pôr um espaço no fim
  // do e-mail, e sem isso o Yup recusaria um e-mail que está certo.
  email: Yup.string()
    .trim()
    .required('Informe o e-mail')
    .email('E-mail inválido'),
  senha: Yup.string()
    .required('Informe a senha')
    .min(6, 'A senha precisa ter 6 caracteres'),
  // O ref aponta para o campo senha e compara os dois valores.
  confirmacao: Yup.string()
    .required('Repita a senha')
    .oneOf([Yup.ref('senha')], 'As senhas não são iguais'),
  nomeDoPet: Yup.string()
    .trim()
    .required('Dê um nome ao seu pet')
    // Nome curto, para caber ao lado da % de saúde na tela Hoje.
    .max(20, 'Use até 20 letras'),
});

export default function Cadastro() {
  async function criarConta(dados: DadosDoCadastro) {
    // Guardamos o e-mail sempre do mesmo jeito, sem espaços e em minúsculas,
    // senão "Ana@email.com" e "ana@email.com" virariam duas contas.
    const email = dados.email.trim().toLowerCase();

    // Não pode existir duas contas com o mesmo e-mail.
    const jaExiste = await buscarUsuarioPorEmail(email);

    if (jaExiste !== null) {
      Alert.alert(
        'Este e-mail já tem conta',
        'Volte e entre com ele, ou use outro e-mail.'
      );
      return;
    }

    await salvarUsuario({
      nome: dados.nome.trim(),
      email: email,
      senha: dados.senha,
    });

    // Ainda não existe sessão (a pessoa só vai entrar depois), então o pet
    // é salvo com o e-mail passado direto, e não pelo usuário logado.
    await salvarPetDaConta(email, { nome: dados.nomeDoPet.trim() });

    if (Platform.OS === 'android') {
      ToastAndroid.show('Conta criada. Agora é só entrar.', ToastAndroid.SHORT);
    }

    // back volta para o Login que já estava na pilha, em vez de empilhar
    // outro. Com replace ficariam duas telas de Login, uma atrás da outra.
    router.back();
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Seus remédios e seu pet ficam guardados neste aparelho, na sua conta.
      </Text>

      <Formik
        initialValues={valoresIniciais}
        validationSchema={regrasDeValidacao}
        onSubmit={criarConta}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldTouched,
          isSubmitting,
        }) => (
          <>
            <CampoTexto
              rotulo="Nome"
              valor={values.nome}
              aoMudarTexto={handleChange('nome')}
              aoSair={() => setFieldTouched('nome')}
              erro={touched.nome ? errors.nome : undefined}
              placeholder="Como podemos te chamar?"
              capitalizar="words"
            />

            <CampoTexto
              rotulo="E-mail"
              valor={values.email}
              aoMudarTexto={handleChange('email')}
              aoSair={() => setFieldTouched('email')}
              erro={touched.email ? errors.email : undefined}
              tipoTeclado="email-address"
              placeholder="voce@email.com"
            />

            <CampoTexto
              rotulo="Senha"
              valor={values.senha}
              aoMudarTexto={handleChange('senha')}
              aoSair={() => setFieldTouched('senha')}
              erro={touched.senha ? errors.senha : undefined}
              segredo
              placeholder="Mínimo de 6 caracteres"
            />

            <CampoTexto
              rotulo="Repita a senha"
              valor={values.confirmacao}
              aoMudarTexto={handleChange('confirmacao')}
              aoSair={() => setFieldTouched('confirmacao')}
              erro={touched.confirmacao ? errors.confirmacao : undefined}
              segredo
              placeholder="A mesma senha"
            />

            <CampoTexto
              rotulo="Nome do seu pet"
              valor={values.nomeDoPet}
              aoMudarTexto={handleChange('nomeDoPet')}
              aoSair={() => setFieldTouched('nomeDoPet')}
              erro={touched.nomeDoPet ? errors.nomeDoPet : undefined}
              placeholder="Pipo"
              capitalizar="words"
              dica="Ele fica saudável quando você toma os remédios na hora."
            />

            <Botao
              titulo="Criar conta"
              aoPressionar={() => handleSubmit()}
              desabilitado={isSubmitting}
            />
          </>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.nevoa,
  },
  conteudo: {
    padding: 20,
  },
  intro: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.texto,
    color: CORES.ameixaSuave,
    marginBottom: 20,
  },
});
