import { Redirect, router } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import * as Yup from 'yup';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { CORES } from '../constants/cores';
import {
  buscarUsuarioPorEmail,
  lerSessao,
  salvarSessao,
} from '../services/storage';

interface DadosDoLogin {
  email: string;
  senha: string;
}

const valoresIniciais: DadosDoLogin = {
  email: '',
  senha: '',
};

// O Yup só descreve as regras. Quem chama essas regras é o Formik.
const regrasDeValidacao = Yup.object({
  // trim antes de validar: o teclado do celular costuma pôr um espaço no fim
  // do e-mail, e sem isso o Yup recusaria um e-mail que está certo.
  email: Yup.string()
    .trim()
    .required('Informe o e-mail')
    .email('E-mail inválido'),
  senha: Yup.string()
    .required('Informe a senha')
    .min(6, 'A senha precisa ter 6 caracteres'),
});

export default function Login() {
  // Ao abrir o app, ainda não sabemos se alguém ficou logado da última vez.
  // Enquanto o AsyncStorage não responde, a situação é 'verificando'.
  const [sessao, setSessao] = useState<'verificando' | 'logado' | 'deslogado'>(
    'verificando'
  );

  useEffect(() => {
    async function verificarSessao() {
      const email = await lerSessao();
      setSessao(email === null ? 'deslogado' : 'logado');
    }

    verificarSessao();
  }, []);

  // É async porque ler o AsyncStorage demora, e por isso usamos await.
  async function entrar(dados: DadosDoLogin) {
    // "Ana@Email.com " e "ana@email.com" são o mesmo e-mail para o usuário.
    const email = dados.email.trim().toLowerCase();
    const usuario = await buscarUsuarioPorEmail(email);

    if (usuario === null || usuario.senha !== dados.senha) {
      Alert.alert('Não deu certo', 'E-mail ou senha incorretos.');
      return;
    }

    await salvarSessao(usuario.email);

    // O Toast só existe no Android, por isso a checagem antes.
    if (Platform.OS === 'android') {
      ToastAndroid.show('Bem-vindo, ' + usuario.nome, ToastAndroid.SHORT);
    }

    // replace impede que o botão físico de voltar retorne para o Login.
    router.replace('/inicio');
  }

  // Tela vazia por um instante, em vez de piscar o formulário de login
  // para quem já estava logado.
  if (sessao === 'verificando') {
    return <View style={styles.tela} />;
  }

  // Redirect é o componente do Expo Router que troca de rota assim que é
  // desenhado. Funciona como um router.replace, sem deixar o Login na pilha.
  if (sessao === 'logado') {
    return <Redirect href="/inicio" />;
  }

  return (
    <View style={styles.tela}>
      <View style={styles.marca}>
        {/* O require é resolvido antes do app rodar, por isso o caminho
            precisa estar escrito por extenso e não numa variável. */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.nomeDoApp}>RemindIO</Text>
        <Text style={styles.frase}>Entre para cuidar do seu pet</Text>
      </View>

      <Formik
        initialValues={valoresIniciais}
        validationSchema={regrasDeValidacao}
        onSubmit={entrar}
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
          <View>
            <CampoTexto
              rotulo="E-mail"
              valor={values.email}
              aoMudarTexto={handleChange('email')}
              aoSair={() => setFieldTouched('email')}
              // O erro só aparece depois que o usuário passou pelo campo.
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
              placeholder="Sua senha"
            />

            <View style={styles.espaco}>
              <Botao
                titulo="Entrar"
                aoPressionar={() => handleSubmit()}
                desabilitado={isSubmitting}
              />
            </View>

            <Botao
              titulo="Criar uma conta"
              variante="secundario"
              aoPressionar={() => router.push('/cadastro')}
            />
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.gelo,
    padding: 20,
    justifyContent: 'center',
  },
  marca: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 160,
    resizeMode: 'contain',
  },
  nomeDoApp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CORES.noite,
    marginTop: 8,
  },
  frase: {
    fontSize: 14,
    color: CORES.roxo,
    marginTop: 2,
  },
  espaco: {
    marginTop: 8,
    marginBottom: 12,
  },
});
