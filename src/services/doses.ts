import { Dose, Remedio, SituacaoDaDose, Tomada } from '../types';
import { dataDeHoje, horarioEmMinutos, minutosDeAgora } from './datas';
import { TOLERANCIA_EM_MINUTOS } from './pet';

// Quanto tempo antes do horário o usuário já pode confirmar a dose.
// Sem esse limite, dava para marcar às 08:00 a dose das 20:00.
export const ANTECEDENCIA_EM_MINUTOS = 60;

// Transforma a lista de remédios na lista de doses de hoje, uma por horário,
// já em ordem de horário. Sem a ordenação, as doses apareciam na ordem em que
// os remédios foram cadastrados, e a das 06:00 podia ficar depois da das 20:00.
export function montarDosesDeHoje(remedios: Remedio[]): Dose[] {
  const doses: Dose[] = [];

  for (let i = 0; i < remedios.length; i++) {
    for (let j = 0; j < remedios[i].horarios.length; j++) {
      doses.push({ remedio: remedios[i], horario: remedios[i].horarios[j] });
    }
  }

  // O sort compara duas doses por vez: um número negativo põe a primeira
  // antes. Comparamos em minutos porque "8:00" e "08:00" como texto
  // não ordenariam direito.
  doses.sort(function (a, b) {
    return horarioEmMinutos(a.horario) - horarioEmMinutos(b.horario);
  });

  return doses;
}

// Procura nas tomadas se essa dose já foi confirmada hoje.
export function foiTomadaHoje(
  remedioId: string,
  horario: string,
  tomadas: Tomada[]
): boolean {
  const hoje = dataDeHoje();

  for (let i = 0; i < tomadas.length; i++) {
    if (
      tomadas[i].remedioId === remedioId &&
      tomadas[i].horario === horario &&
      tomadas[i].data === hoje
    ) {
      return true;
    }
  }

  return false;
}

// Decide em que situação a dose está agora. A tela usa a resposta para
// escolher o que mostrar: botão liberado, aviso de atraso ou "Tomada".
export function situacaoDaDose(dose: Dose, tomadas: Tomada[]): SituacaoDaDose {
  if (foiTomadaHoje(dose.remedio.id, dose.horario, tomadas)) {
    return 'tomada';
  }

  const agora = minutosDeAgora();
  const horario = horarioEmMinutos(dose.horario);

  if (agora < horario - ANTECEDENCIA_EM_MINUTOS) {
    return 'aguardando';
  }

  // A mesma tolerância que o pet usa para cobrar a dose: os dois lados
  // precisam concordar sobre quando uma dose está atrasada.
  if (agora > horario + TOLERANCIA_EM_MINUTOS) {
    return 'atrasada';
  }

  return 'liberada';
}
