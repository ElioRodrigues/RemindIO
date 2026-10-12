import { Formik } from 'formik';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import { CORES } from '../constants/cores';
import { FONTES } from '../constants/fontes';
import { horariosDoCiclo } from '../services/datas';
import { Remedio } from '../types';
import { Botao } from './Botao';
import { CampoFoto } from './CampoFoto';
import { CampoTexto } from './CampoTexto';

// O que o formulário entrega para a tela: um remédio completo, menos o id.
// Omit<Remedio, 'id'> quer dizer "o tipo Remedio sem o campo id". Quem
// decide o id é a tela: a de novo cria um, a de editar mantém o antigo.
export type RemedioDoFormulario = Omit<Remedio, 'id'>;

export interface FormularioRemedioProps {
  // Quando vem um remédio, o formulário abre preenchido (tela de editar).
  // Quando não vem, abre vazio (tela de novo).
  remedio?: Remedio;
  tituloDoBotao: string;
  aoSalvar(dados: RemedioDoFormulario): Promise<void>;
}

// Os campos como o usuário digita: tudo texto, até o intervalo. Só no fim
// eles viram o formato do Remedio (lista de horários, número de horas).
interface CamposDoFormulario {
  nome: string;
  dosagem: string;
  horarios: string;
  horaInicial: string;
  intervalo: string;
  observacao: string;
}

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
  nome: Yup.string().trim().required('Informe o nome do remédio'),
  dosagem: Yup.string().trim().required('Informe a dosagem'),
  horarios: Yup.string()
    .required('Informe pelo menos um horário')
    .matches(FORMATO_DA_LISTA, 'Use horários de 00:00 a 23:59, como 08:00, 20:00')
    // test é uma regra feita à mão: devolve true quando o valor é válido.
    .test('sem-repetidos', 'Tem um horário repetido', function (valor) {
      return valor === undefined || !temHorarioRepetido(valor);
    }),
});

const regrasDoModoCiclo = Yup.object({
  nome: Yup.string().trim().required('Informe o nome do remédio'),
  dosagem: Yup.string().trim().required('Informe a dosagem'),
  horaInicial: Yup.string()
    .required('Informe o primeiro horário')
    .matches(FORMATO_DE_UM_HORARIO, 'Use um horário de 00:00 a 23:59, como 08:00'),
  intervalo: Yup.number()
    .typeError('Informe um número de horas')
    .required('Informe de quantas em quantas horas')
    .min(1, 'O intervalo mínimo é 1 hora')
    .max(24, 'O intervalo máximo é 24 horas'),
});

// O caminho de volta: transforma um Remedio salvo nos campos do formulário,
// para a tela de editar abrir preenchida.
function camposDoRemedio(remedio: Remedio | undefined): CamposDoFormulario {
  if (remedio === undefined) {
    return {
      nome: '',
      dosagem: '',
      horarios: '',
      horaInicial: '',
      intervalo: '',
      observacao: '',
    };
  }

  const ehCiclo = remedio.intervaloEmHoras > 0;

  return {
    nome: remedio.nome,
    dosagem: remedio.dosagem,
    // No modo fixo os horários voltam a ser um texto separado por vírgula.
    horarios: ehCiclo ? '' : remedio.horarios.join(', '),
    // No modo ciclo, o primeiro horário da lista é o horário inicial.
    horaInicial: ehCiclo ? remedio.horarios[0] : '',
    intervalo: ehCiclo ? String(remedio.intervaloEmHoras) : '',
    observacao: remedio.observacao,
  };
}

// O mesmo formulário serve para cadastrar e para editar. Antes ele estava
// dentro da tela de novo remédio; copiar tudo para a tela de editar daria
// duas regras de validação para manter iguais na mão.
export function FormularioRemedio(props: FormularioRemedioProps) {
  // O modo fica fora do Formik porque ele decide quais campos aparecem.
  // Ao editar um remédio em ciclo, o formulário já abre no modo ciclo.
  const [modo, setModo] = useState<'fixo' | 'ciclo'>(
    props.remedio !== undefined && props.remedio.intervaloEmHoras > 0
      ? 'ciclo'
      : 'fixo'
  );
  // A foto também fica fora do Formik: ela não é digitada nem validada,
  // só escolhida. '' quer dizer "sem foto".
  const [foto, setFoto] = useState(
    props.remedio !== undefined && props.remedio.foto ? props.remedio.foto : ''
  );

  async function enviar(campos: CamposDoFormulario) {
    let listaDeHorarios: string[] = [];
    let intervaloEmHoras = 0;

    if (modo === 'ciclo') {
      intervaloEmHoras = Number(campos.intervalo);
      listaDeHorarios = horariosDoCiclo(campos.horaInicial, intervaloEmHoras);
    } else {
      // No modo fixo o usuário digita tudo num campo só, separado por vírgula.
      listaDeHorarios = separarHorarios(campos.horarios);
    }

    // Quem grava é a tela: o formulário só monta os dados.
    await props.aoSalvar({
      nome: campos.nome.trim(),
      dosagem: campos.dosagem.trim(),
      horarios: listaDeHorarios,
      intervaloEmHoras: intervaloEmHoras,
      observacao: campos.observacao.trim(),
      // Aqui a foto ainda pode ser o endereço temporário da câmera. A tela
      // que salva é quem copia para a pasta do app (guardarFoto).
      foto: foto,
    });
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Formik
        initialValues={camposDoRemedio(props.remedio)}
        validationSchema={modo === 'fixo' ? regrasDoModoFixo : regrasDoModoCiclo}
        onSubmit={enviar}
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
            <CampoFoto foto={foto} aoMudarFoto={setFoto} />

            <CampoTexto
              rotulo="Nome do remédio"
              valor={values.nome}
              aoMudarTexto={handleChange('nome')}
              aoSair={() => setFieldTouched('nome')}
              erro={touched.nome ? errors.nome : undefined}
              placeholder="Losartana"
              capitalizar="sentences"
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

            {/* Controle segmentado: duas opções lado a lado, numa faixa só,
                e a escolhida fica destacada em branco. Deixa claro que é
                uma escolha entre as duas, coisa que dois botões soltos não
                deixavam. */}
            <View style={styles.seletor}>
              <Pressable
                style={[styles.opcao, modo === 'fixo' ? styles.opcaoAtiva : null]}
                onPress={() => setModo('fixo')}
              >
                <Text style={styles.textoDaOpcao}>Horários fixos</Text>
              </Pressable>

              <Pressable
                style={[styles.opcao, modo === 'ciclo' ? styles.opcaoAtiva : null]}
                onPress={() => setModo('ciclo')}
              >
                <Text style={styles.textoDaOpcao}>A cada X horas</Text>
              </Pressable>
            </View>

            {modo === 'fixo' ? (
              <CampoTexto
                rotulo="Horários"
                valor={values.horarios}
                aoMudarTexto={handleChange('horarios')}
                aoSair={() => setFieldTouched('horarios')}
                erro={touched.horarios ? errors.horarios : undefined}
                placeholder="08:00, 20:00"
                dica="Separe os horários por vírgula."
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
                    ).join(', ')}
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
              capitalizar="sentences"
              dica="Opcional."
            />

            <Botao
              titulo={props.tituloDoBotao}
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
  rotulo: {
    fontFamily: FONTES.textoForte,
    fontSize: 15,
    color: CORES.ameixa,
    marginBottom: 6,
  },
  seletor: {
    flexDirection: 'row',
    backgroundColor: CORES.lavandaClara,
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  opcao: {
    // flex: 1 nas duas opções divide a faixa ao meio.
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  opcaoAtiva: {
    backgroundColor: CORES.branco,
  },
  textoDaOpcao: {
    fontFamily: FONTES.textoForte,
    fontSize: 15,
    color: CORES.ameixa,
  },
  previa: {
    fontFamily: FONTES.textoForte,
    fontSize: 15,
    color: CORES.salvia,
    marginBottom: 16,
  },
});
