import { Formik } from 'formik';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';
import { Botao } from './Botao';
import { CampoTexto } from './CampoTexto';

export interface JanelaNomeDoPetProps {
  visivel: boolean;
  nomeAtual: string;
  aoFechar(): void;
  aoSalvar(novoNome: string): Promise<void>;
}

// As mesmas regras do campo de nome do pet no Cadastro.
const regrasDoNome = Yup.object({
  nome: Yup.string()
    .trim()
    .required('Dê um nome ao seu pet')
    .max(20, 'Use até 20 letras'),
});

// Uma janela por cima da tela de Ajustes para trocar o nome do pet.
// Modal é um componente do próprio React Native: desenha o conteúdo por
// cima de tudo, e some quando visible fica false.
export function JanelaNomeDoPet(props: JanelaNomeDoPetProps) {
  return (
    <Modal
      visible={props.visivel}
      // transparent deixa ver a tela de trás pelo véu escuro.
      transparent
      animationType="fade"
      // onRequestClose é chamado pelo botão de voltar do Android.
      onRequestClose={props.aoFechar}
    >
      {/* ScrollView com keyboardShouldPersistTaps="handled": o toque no
          botão chega nele mesmo com o teclado aberto. */}
      <ScrollView
        style={styles.veu}
        contentContainerStyle={styles.centro}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.janela}>
          <Text style={styles.titulo}>Novo nome do pet</Text>

          {/* Quando o Modal fecha, o conteúdo dele sai da tela. Ao abrir de
              novo o Formik começa do zero, já com o nome atual. */}
          <Formik
            initialValues={{ nome: props.nomeAtual }}
            validationSchema={regrasDoNome}
            onSubmit={(valores) => props.aoSalvar(valores.nome.trim())}
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
                  rotulo="Nome"
                  valor={values.nome}
                  aoMudarTexto={handleChange('nome')}
                  aoSair={() => setFieldTouched('nome')}
                  erro={touched.nome ? errors.nome : undefined}
                  capitalizar="words"
                />

                <View style={styles.botoes}>
                  <Botao
                    titulo="Salvar nome"
                    aoPressionar={() => handleSubmit()}
                    desabilitado={isSubmitting}
                  />
                  <Botao
                    titulo="Cancelar"
                    variante="secundario"
                    aoPressionar={props.aoFechar}
                  />
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  veu: {
    flex: 1,
    backgroundColor: CORES.veu,
  },
  centro: {
    // flexGrow para ocupar a tela toda e conseguir centralizar a janela.
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  janela: {
    backgroundColor: CORES.nevoa,
    borderRadius: 28,
    padding: 20,
  },
  titulo: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    color: CORES.ameixa,
    marginBottom: 12,
  },
  botoes: {
    gap: 10,
    marginTop: 4,
  },
});
