// Funções de data e hora usadas por mais de uma tela.
// Ficam aqui para não repetir o mesmo cálculo em cada arquivo.

// Transforma 8 em "08", para os textos ficarem sempre com dois dígitos.
function doisDigitos(numero: number): string {
  if (numero < 10) {
    return '0' + numero;
  }
  return String(numero);
}

// Guardamos a data como texto no formato 2026-09-06 para poder comparar
// com ===. Dois objetos Date nunca são iguais nessa comparação.
export function dataDeHoje(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = doisDigitos(agora.getMonth() + 1);
  const dia = doisDigitos(agora.getDate());

  return ano + '-' + mes + '-' + dia;
}

export function dataDeOntem(): string {
  return dataDeDiasAtras(1);
}

// A data de N dias atrás, no mesmo formato: 1 é ontem, 7 é uma semana atrás.
// Usada pelo histórico, que percorre os dias para trás.
export function dataDeDiasAtras(dias: number): string {
  const dia = new Date();
  // setDate com valor negativo já vira o mês e o ano sozinho.
  dia.setDate(dia.getDate() - dias);

  const ano = dia.getFullYear();
  const mes = doisDigitos(dia.getMonth() + 1);
  const numero = doisDigitos(dia.getDate());

  return ano + '-' + mes + '-' + numero;
}

// Devolve o instante da meia-noite de hoje, em milissegundos. Serve para
// saber se um remédio foi cadastrado hoje ou antes, porque o id do remédio
// é o momento em que ele foi criado.
export function inicioDoDiaDeHoje(): number {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  return agora.getTime();
}

// O instante (em milissegundos) em que um horário acontece hoje: "08:30"
// vira a meia-noite de hoje mais 8h30. Serve para comparar uma dose com o
// instante em que o remédio foi cadastrado (o id dele).
export function instanteDoHorarioDeHoje(horario: string): number {
  return inicioDoDiaDeHoje() + horarioEmMinutos(horario) * 60 * 1000;
}

// O instante (em milissegundos) de um horário numa data qualquer:
// '2026-10-11' e '08:30' viram 11/10/2026 às 08:30. É a versão do
// instanteDoHorarioDeHoje para os dias passados do histórico.
export function instanteDoHorarioNaData(data: string, horario: string): number {
  const partes = data.split('-');
  // No Date o mês começa em 0 (janeiro), por isso o - 1.
  const meiaNoite = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  ).getTime();

  return meiaNoite + horarioEmMinutos(horario) * 60 * 1000;
}

// Transforma "08:30" em 510, para comparar horários com números.
export function horarioEmMinutos(horario: string): number {
  const partes = horario.split(':');
  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  return horas * 60 + minutos;
}

// O caminho de volta: 510 vira "08:30". Serve para mostrar na tela um
// horário que foi calculado em minutos, como "a partir de 07:00".
export function minutosEmHorario(minutos: number): string {
  // Um dia tem 1440 minutos. O resto da divisão faz -30 virar 1410 (23:30),
  // em vez de um horário negativo.
  const noDia = ((minutos % 1440) + 1440) % 1440;
  const horas = Math.floor(noDia / 60);
  const resto = noDia % 60;

  return doisDigitos(horas) + ':' + doisDigitos(resto);
}

export function minutosDeAgora(): number {
  const agora = new Date();
  return agora.getHours() * 60 + agora.getMinutes();
}

// Monta os horários de um ciclo: a partir de 08:00 a cada 8 horas
// devolve 08:00, 16:00 e 00:00.
export function horariosDoCiclo(
  horaInicial: string,
  intervaloEmHoras: number
): string[] {
  const partes = horaInicial.split(':');

  // Sem essa proteção, um intervalo 0 ou um texto inválido deixariam
  // o while abaixo rodando para sempre e o app travaria.
  if (partes.length !== 2 || intervaloEmHoras < 1) {
    return [];
  }

  const horaDeInicio = Number(partes[0]);
  const minutos = partes[1];

  if (isNaN(horaDeInicio)) {
    return [];
  }

  const lista: string[] = [];
  let hora = horaDeInicio;

  // Para quando completar as 24 horas do dia.
  while (hora < horaDeInicio + 24) {
    const horaDoDia = hora % 24;
    lista.push(doisDigitos(horaDoDia) + ':' + minutos);
    hora = hora + intervaloEmHoras;
  }

  return lista;
}

// "Bom dia", "Boa tarde" ou "Boa noite", pela hora do aparelho.
export function saudacao(): string {
  const hora = new Date().getHours();

  if (hora < 5) {
    return 'Boa noite';
  }
  if (hora < 12) {
    return 'Bom dia';
  }
  if (hora < 18) {
    return 'Boa tarde';
  }
  return 'Boa noite';
}

// Transforma um instante em milissegundos em "11/10/2026". Serve para mostrar
// quando o remédio foi cadastrado, já que o id dele é esse instante.
export function dataPorExtenso(milissegundos: number): string {
  const data = new Date(milissegundos);
  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1);

  return dia + '/' + mes + '/' + data.getFullYear();
}

const DIAS_DA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

// '2026-10-11' vira 'dom, 11/10'. É o título de cada dia do histórico.
export function diaDaSemanaEData(data: string): string {
  const partes = data.split('-');
  const dia = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  );

  // getDay devolve 0 para domingo, 1 para segunda... e serve de posição
  // na lista de nomes.
  return DIAS_DA_SEMANA[dia.getDay()] + ', ' + partes[2] + '/' + partes[1];
}
