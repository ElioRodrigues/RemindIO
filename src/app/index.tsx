import { router } from 'expo-router';
import { Formik } from 'formik';
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
import { buscarUsuarioPorEmail, salvarSessao } from '../services/storage';

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
  email: Yup.string().required('Informe o e-mail').email('E-mail inválido'),
  senha: Yup.string()
    .required('Informe a senha')
    .min(6, 'A senha precisa ter 6 caracteres'),
});

export default function Login() {
  // É async porque ler o AsyncStorage demora, e por isso usamos await.
  async function entrar(dados: DadosDoLogin) {
    const usuario = await buscarUsuarioPorEmail(dados.email);

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
