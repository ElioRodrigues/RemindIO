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
  const ontem = new Date();
  // setDate com valor negativo já vira o mês e o ano sozinho.
  ontem.setDate(ontem.getDate() - 1);

  const ano = ontem.getFullYear();
  const mes = doisDigitos(ontem.getMonth() + 1);
  const dia = doisDigitos(ontem.getDate());

  return ano + '-' + mes + '-' + dia;
}

// Devolve o instante da meia-noite de hoje, em milissegundos. Serve para
// saber se um remédio foi cadastrado hoje ou antes, porque o id do remédio
// é o momento em que ele foi criado.
export function inicioDoDiaDeHoje(): number {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  return agora.getTime();
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
