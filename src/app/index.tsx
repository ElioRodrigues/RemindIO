import { Redirect, router } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';
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
      // A mensagem não diz qual dos dois está errado de propósito: dizer
      // "e-mail não existe" revelaria quem tem conta no app.
      Alert.alert(
        'E-mail ou senha incorretos',
        'Confira os dois e tente de novo.'
      );
      return;
    }

    await salvarSessao(usuario.email);

    // O Toast só existe no Android, por isso a checagem antes.
    if (Platform.OS === 'android') {
      ToastAndroid.show('Olá, ' + usuario.nome.split(' ')[0], ToastAndroid.SHORT);
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
    <SafeAreaView style={styles.tela}>
      {/* ScrollView para o teclado não esconder os campos: com ele aberto,
          dá para rolar até o botão. keyboardShouldPersistTaps deixa tocar
          no botão sem precisar fechar o teclado antes. */}
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.marca}>
          {/* O require é resolvido antes do app rodar, por isso o caminho
              precisa estar escrito por extenso e não numa variável. */}
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.nomeDoApp}>RemindIO</Text>
          <Text style={styles.frase}>
            Seus remédios na hora certa, e um pet que sente a diferença.
          </Text>
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
                titulo="Criar conta"
                variante="secundario"
                aoPressionar={() => router.push('/cadastro')}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.nevoa,
  },
  conteudo: {
    // flexGrow, e não flex: deixa o conteúdo ocupar a tela toda (para
    // centralizar) e ainda assim crescer e rolar quando o teclado abre.
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  marca: {
    backgroundColor: CORES.lavandaClara,
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 150,
    height: 130,
    resizeMode: 'contain',
  },
  nomeDoApp: {
    fontFamily: FONTES.tituloForte,
    fontSize: TAMANHOS.tituloGrande,
    lineHeight: 44,
    color: CORES.ameixa,
    marginTop: 4,
  },
  frase: {
    fontFamily: FONTES.texto,
    fontSize: 15,
    color: CORES.ameixaSuave,
    textAlign: 'center',
  },
  espaco: {
    marginTop: 4,
    marginBottom: 12,
  },
});
