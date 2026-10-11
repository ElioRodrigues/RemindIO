import { router } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import * as Yup from 'yup';
import { Botao } from '../../../components/Botao';
import { CampoTexto } from '../../../components/CampoTexto';
import { CORES } from '../../../constants/cores';
import { horariosDoCiclo } from '../../../services/datas';
import { salvarRemedio } from '../../../services/storage';

interface DadosDoRemedio {
  nome: string;
  dosagem: string;
  horarios: string;
  horaInicial: string;
  intervalo: string;
  observacao: string;
}

const valoresIniciais: DadosDoRemedio = {
  nome: '',
  dosagem: '',
  horarios: '',
  horaInicial: '',
  intervalo: '',
  observacao: '',
};

// Um horário de verdade: a hora vai de 00 a 23 ([01]\d pega 00 a 19,
// 2[0-3] pega 20 a 23) e os minutos de 00 a 59. Antes a regra era só
// "dois dígitos, dois pontos, dois dígitos", e 25:99 passava.
const HORA = '([01]\\d|2[0-3]):[0-5]\\d';

// Aceita 08:00 ou vários horários separados por vírgula: 08:00, 20:00
const FORMATO_DA_LISTA = new RegExp('^' + HORA + '(\\s*,\\s*' + HORA + ')*$');
// Aceita um horário só: 08:00
const FORMATO_DE_UM_HORARIO = new RegExp('^' + HORA + '$');

// Separa "08:00, 20:00" em ["08:00", "20:00"], sem os espaços.
function separarHorarios(texto: string): string[] {
  const partes = texto.split(',');
  const lista: string[] = [];

  for (let i = 0; i < partes.length; i++) {
    lista.push(partes[i].trim());
  }

  return lista;
}

// true quando algum horário aparece duas vezes. Um horário repetido viraria
// duas doses iguais no Início, e o pet cobraria a mesma dose duas vezes.
function temHorarioRepetido(texto: string): boolean {
  const lista = separarHorarios(texto);

  for (let i = 0; i < lista.length; i++) {
    // indexOf devolve a primeira posição do valor. Se não for a posição
    // atual, é porque o mesmo horário já apareceu antes.
    if (lista.indexOf(lista[i]) !== i) {
      return true;
    }
  }

  return false;
}

// Cada modo tem as suas regras, porque os campos preenchidos são outros.
const regrasDoModoFixo = Yup.object({
  nome: Yup.string().required('Informe o nome do remédio'),
  dosagem: Yup.string().required('Informe a dosagem'),
  horarios: Yup.string()
    .required('Informe pelo menos um horário')
    .matches(FORMATO_DA_LISTA, 'Use horários de 00:00 a 23:59, como 08:00, 20:00')
    // test é uma regra feita à mão: devolve true quando o valor é válido.
    .test('sem-repetidos', 'Tem um horário repetido', function (valor) {
      return valor === undefined || !temHorarioRepetido(valor);
    }),
});

const regrasDoModoCiclo = Yup.object({
  nome: Yup.string().required('Informe o nome do remédio'),
  dosagem: Yup.string().required('Informe a dosagem'),
  horaInicial: Yup.string()
    .required('Informe o primeiro horário')
    .matches(FORMATO_DE_UM_HORARIO, 'Use um horário de 00:00 a 23:59, como 08:00'),
  intervalo: Yup.number()
    .typeError('Informe um número de horas')
    .required('Informe de quantas em quantas horas')
    .min(1, 'O intervalo mínimo é 1 hora')
    .max(24, 'O intervalo máximo é 24 horas'),
});

export default function NovoRemedio() {
  // O modo fica fora do Formik porque ele decide quais campos aparecem.
  const [modo, setModo] = useState<'fixo' | 'ciclo'>('fixo');

  async function salvar(dados: DadosDoRemedio) {
    let listaDeHorarios: string[] = [];
    let intervaloEmHoras = 0;

    if (modo === 'ciclo') {
      intervaloEmHoras = Number(dados.intervalo);
      listaDeHorarios = horariosDoCiclo(dados.horaInicial, intervaloEmHoras);
    } else {
      // No modo fixo o usuário digita tudo num campo só, separado por vírgula.
      listaDeHorarios = separarHorarios(dados.horarios);
    }

    await salvarRemedio({
      // A hora atual em milissegundos serve como identificador único.
      id: String(Date.now()),
      nome: dados.nome,
      dosagem: dados.dosagem,
      horarios: listaDeHorarios,
      intervaloEmHoras: intervaloEmHoras,
      observacao: dados.observacao,
    });

    if (Platform.OS === 'android') {
      ToastAndroid.show('Remédio salvo!', ToastAndroid.SHORT);
    }

    router.back();
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Formik
        initialValues={valoresIniciais}
        validationSchema={modo === 'fixo' ? regrasDoModoFixo : regrasDoModoCiclo}
        onSubmit={salvar}
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
              rotulo="Nome do remédio"
              valor={values.nome}
              aoMudarTexto={handleChange('nome')}
              aoSair={() => setFieldTouched('nome')}
              erro={touched.nome ? errors.nome : undefined}
              placeholder="Losartana"
            />

            <CampoTexto
              rotulo="Dosagem"
              valor={values.dosagem}
              aoMudarTexto={handleChange('dosagem')}
              aoSair={() => setFieldTouched('dosagem')}
              erro={touched.dosagem ? errors.dosagem : undefined}
              placeholder="50 mg"
            />

            <Text style={styles.rotulo}>Como são os horários?</Text>

            <View style={styles.seletor}>
              <View style={styles.opcao}>
                <Botao
                  titulo="Horários fixos"
                  variante={modo === 'fixo' ? 'primario' : 'secundario'}
                  aoPressionar={() => setModo('fixo')}
                />
              </View>

              <View style={styles.opcao}>
                <Botao
                  titulo="A cada X horas"
                  variante={modo === 'ciclo' ? 'primario' : 'secundario'}
                  aoPressionar={() => setModo('ciclo')}
                />
              </View>
            </View>

            {modo === 'fixo' ? (
              <CampoTexto
                rotulo="Horários"
                valor={values.horarios}
                aoMudarTexto={handleChange('horarios')}
                aoSair={() => setFieldTouched('horarios')}
                erro={touched.horarios ? errors.horarios : undefined}
                placeholder="08:00, 20:00"
              />
            ) : (
              <>
                <CampoTexto
                  rotulo="Primeiro horário"
                  valor={values.horaInicial}
                  aoMudarTexto={handleChange('horaInicial')}
                  aoSair={() => setFieldTouched('horaInicial')}
                  erro={touched.horaInicial ? errors.horaInicial : undefined}
                  placeholder="08:00"
                />

                <CampoTexto
                  rotulo="A cada quantas horas?"
                  valor={values.intervalo}
                  aoMudarTexto={handleChange('intervalo')}
                  aoSair={() => setFieldTouched('intervalo')}
                  erro={touched.intervalo ? errors.intervalo : undefined}
                  tipoTeclado="numeric"
                  placeholder="8"
                />

                {/* Mostra os horários calculados antes de salvar. */}
                {values.horaInicial !== '' && values.intervalo !== '' ? (
                  <Text style={styles.previa}>
                    Vai lembrar às{' '}
                    {horariosDoCiclo(
                      values.horaInicial,
                      Number(values.intervalo)
                    ).join('   ')}
                  </Text>
                ) : null}
              </>
            )}

            <CampoTexto
              rotulo="Observação"
              valor={values.observacao}
              aoMudarTexto={handleChange('observacao')}
              aoSair={() => setFieldTouched('observacao')}
              erro={touched.observacao ? errors.observacao : undefined}
              placeholder="Tomar após as refeições"
            />

            <Botao
              titulo="Salvar remédio"
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
    backgroundColor: CORES.gelo,
  },
  conteudo: {
    padding: 20,
  },
  rotulo: {
    fontSize: 14,
    color: CORES.noite,
    marginBottom: 4,
  },
  seletor: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  opcao: {
    flex: 1,
    marginRight: 8,
  },
  previa: {
    fontSize: 14,
    color: CORES.menta,
    marginBottom: 12,
  },
});
