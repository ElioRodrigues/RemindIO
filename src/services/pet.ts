import { EstadoDoPet, Remedio, Tomada } from '../types';
import {
  dataDeHoje,
  dataDeOntem,
  horarioEmMinutos,
  inicioDoDiaDeHoje,
  instanteDoHorarioDeHoje,
  minutosDeAgora,
} from './datas';

// A dose só conta como atrasada depois de uma hora do horário marcado.
export const TOLERANCIA_EM_MINUTOS = 60;

const SAUDE_CHEIA = 100;
// Quanto custa uma dose que o usuário deixou passar sem confirmar.
const DESCONTO_POR_DOSE_PERDIDA = 10;
// Tomar fora do horário custa menos do que não tomar.
const DESCONTO_POR_ATRASO = 5;

// Faixas do desenho do pet. São as mesmas da cor da barra de saúde.
const SAUDE_DE_PET_SAUDAVEL = 60;
const SAUDE_DE_PET_DOENTE = 30;

// Uma dose de hoje só vale se o horário dela vem DEPOIS do cadastro do
// remédio. Quem cadastra às 21:00 um remédio das 07:00 e das 23:00 começa
// pela dose das 23:00: a das 07:00 já tinha passado quando o remédio nem
// existia no app, e não pode ser cobrada nem aparecer como atrasada.
export function doseValeHoje(remedio: Remedio, horario: string): boolean {
  // O id do remédio é o instante do cadastro, em milissegundos.
  return instanteDoHorarioDeHoje(horario) >= Number(remedio.id);
}

// Quanto essa dose custou de saúde: nada se foi tomada no horário,
// um pouco se foi tomada atrasada, e o máximo se não foi tomada.
function descontoDaDose(
  remedioId: string,
  horario: string,
  data: string,
  tomadas: Tomada[]
): number {
  for (let i = 0; i < tomadas.length; i++) {
    if (
      tomadas[i].remedioId === remedioId &&
      tomadas[i].horario === horario &&
      tomadas[i].data === data
    ) {
      if (tomadas[i].atrasada) {
        return DESCONTO_POR_ATRASO;
      }
      return 0;
    }
  }

  return DESCONTO_POR_DOSE_PERDIDA;
}

// A saúde não fica guardada: ela é recalculada a partir do histórico toda
// vez que a tela abre. Assim a mesma dose nunca é descontada duas vezes, e
// o pet reage na hora em que um horário passa sem confirmação.
//
// Só entram na conta as doses de ontem e as de hoje que já venceram.
export function calcularSaude(remedios: Remedio[], tomadas: Tomada[]): number {
  let saude = SAUDE_CHEIA;

  for (let i = 0; i < remedios.length; i++) {
    const remedio = remedios[i];

    // O id do remédio é o instante em que ele foi cadastrado. Um remédio
    // criado hoje não pode ser cobrado pelas doses de ontem.
    const existiaOntem = Number(remedio.id) < inicioDoDiaDeHoje();

    for (let j = 0; j < remedio.horarios.length; j++) {
      const horario = remedio.horarios[j];

      if (existiaOntem) {
        saude =
          saude - descontoDaDose(remedio.id, horario, dataDeOntem(), tomadas);
      }

      // A dose de hoje só é cobrada depois que passou da tolerância.
      const jaVenceu =
        minutosDeAgora() > horarioEmMinutos(horario) + TOLERANCIA_EM_MINUTOS;

      // E só se o remédio já existia no horário da dose. A tela de Início
      // usa a mesma função para montar a cartela, então os dois concordam.
      if (jaVenceu && doseValeHoje(remedio, horario)) {
        saude =
          saude - descontoDaDose(remedio.id, horario, dataDeHoje(), tomadas);
      }
    }
  }

  if (saude < 0) {
    saude = 0;
  }

  return saude;
}

// O desenho do pet vem da saúde: uma medida só, sem duas contas para
// discordarem uma da outra.
export function estadoDoPet(saude: number): EstadoDoPet {
  if (saude < SAUDE_DE_PET_DOENTE) {
    return 'doente';
  }

  if (saude <= SAUDE_DE_PET_SAUDAVEL) {
    return 'abatido';
  }

  return 'saudavel';
}
