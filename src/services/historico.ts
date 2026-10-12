import { Remedio, ResumoDoDia, Tomada } from '../types';
import { dataDeDiasAtras, instanteDoHorarioNaData } from './datas';

// Até quantos dias para trás o histórico vai. Sem um limite, quem usa o app
// há dois anos faria a tela calcular 730 dias toda vez que a aba abre.
const LIMITE_DE_DIAS = 60;

// Monta o resumo de um dia: quantas doses havia e o que aconteceu com cada
// uma. É a mesma ideia do pet: nada é guardado, tudo sai dos remédios e das
// tomadas.
function resumirDia(
  data: string,
  remedios: Remedio[],
  tomadas: Tomada[]
): ResumoDoDia {
  let previstas = 0;
  let noHorario = 0;
  let atrasadas = 0;

  for (let i = 0; i < remedios.length; i++) {
    const remedio = remedios[i];

    for (let j = 0; j < remedio.horarios.length; j++) {
      const horario = remedio.horarios[j];

      // A mesma regra do doseValeHoje, para um dia qualquer: a dose só
      // conta se o remédio já existia naquele horário (o id é o instante
      // do cadastro).
      if (instanteDoHorarioNaData(data, horario) < Number(remedio.id)) {
        continue;
      }

      previstas = previstas + 1;

      // Procura a tomada desse remédio, nesse horário, nesse dia.
      for (let k = 0; k < tomadas.length; k++) {
        if (
          tomadas[k].remedioId === remedio.id &&
          tomadas[k].horario === horario &&
          tomadas[k].data === data
        ) {
          if (tomadas[k].atrasada) {
            atrasadas = atrasadas + 1;
          } else {
            noHorario = noHorario + 1;
          }
          // Achou: não precisa olhar as outras tomadas.
          break;
        }
      }
    }
  }

  const tomadasNoDia = noHorario + atrasadas;

  return {
    data: data,
    previstas: previstas,
    noHorario: noHorario,
    atrasadas: atrasadas,
    perdidas: previstas - tomadasNoDia,
    // Math.round arredonda: 2 de 3 dá 66,66...% e vira 67%.
    porcentagem: previstas === 0 ? 0 : Math.round((tomadasNoDia / previstas) * 100),
  };
}

// A lista de dias do histórico, do mais recente (ontem) para o mais antigo.
// Hoje fica de fora: o dia ainda não acabou, e quem mostra hoje é a cartela.
export function montarHistorico(
  remedios: Remedio[],
  tomadas: Tomada[]
): ResumoDoDia[] {
  const dias: ResumoDoDia[] = [];

  if (remedios.length === 0) {
    return dias;
  }

  // O cadastro mais antigo diz até onde vale a pena voltar: antes dele,
  // não existia remédio nenhum.
  let primeiroCadastro = Number(remedios[0].id);
  for (let i = 1; i < remedios.length; i++) {
    if (Number(remedios[i].id) < primeiroCadastro) {
      primeiroCadastro = Number(remedios[i].id);
    }
  }

  for (let diasAtras = 1; diasAtras <= LIMITE_DE_DIAS; diasAtras++) {
    const data = dataDeDiasAtras(diasAtras);

    // O dia inteiro (até 23:59) aconteceu antes do primeiro cadastro: daqui
    // para trás só haveria dias vazios.
    if (instanteDoHorarioNaData(data, '23:59') < primeiroCadastro) {
      break;
    }

    const resumo = resumirDia(data, remedios, tomadas);

    // Um dia sem nenhuma dose (o remédio foi cadastrado à noite, depois do
    // último horário) não tem o que mostrar.
    if (resumo.previstas > 0) {
      dias.push(resumo);
    }
  }

  return dias;
}

// A adesão dos últimos N dias: de todas as doses que havia, quantas por
// cento foram tomadas. Devolve null quando não há nenhum dia para contar,
// para a tela mostrar "—" em vez de um 0% que pareceria uma bronca.
export function adesaoDosUltimosDias(
  historico: ResumoDoDia[],
  dias: number
): number | null {
  // As datas estão no formato 2026-10-11, então comparar o texto funciona
  // como comparar a data: '2026-10-05' >= '2026-09-30' é verdade, porque o
  // ano vem primeiro, depois o mês, depois o dia.
  const inicio = dataDeDiasAtras(dias);
  let previstas = 0;
  let tomadas = 0;

  for (let i = 0; i < historico.length; i++) {
    if (historico[i].data >= inicio) {
      previstas = previstas + historico[i].previstas;
      tomadas = tomadas + historico[i].noHorario + historico[i].atrasadas;
    }
  }

  if (previstas === 0) {
    return null;
  }

  return Math.round((tomadas / previstas) * 100);
}

// Quantos dias seguidos, de ontem para trás, o usuário tomou TODAS as doses
// (no horário ou atrasadas). Para no primeiro dia com uma dose perdida.
export function sequenciaDeDias(historico: ResumoDoDia[]): number {
  let sequencia = 0;

  // O histórico já vem do mais recente para o mais antigo.
  for (let i = 0; i < historico.length; i++) {
    if (historico[i].perdidas > 0) {
      break;
    }
    sequencia = sequencia + 1;
  }

  return sequencia;
}
