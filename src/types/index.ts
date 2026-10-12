export interface Usuario {
  nome: string;
  email: string;
  senha: string;
}

export interface Remedio {
  id: string;
  nome: string;
  dosagem: string;
  horarios: string[];
  // 0 quando o usuário digitou os horários um a um.
  // Maior que 0 quando escolheu um ciclo de X em X horas.
  intervaloEmHoras: number;
  observacao: string;
  // Endereço da foto da caixa ou da receita, na pasta do app ('' sem foto).
  // O ? diz que o campo pode faltar: os remédios cadastrados antes da
  // câmera existir foram salvos sem ele.
  foto?: string;
}

export interface Tomada {
  remedioId: string;
  horario: string;
  data: string;
  // true quando a dose foi confirmada mais de uma hora depois do horário.
  atrasada: boolean;
}

export interface Pet {
  nome: string;
  // A saúde não fica aqui de propósito: ela é calculada a partir das
  // tomadas, em src/services/pet.ts. Guardar os dois daria duas versões
  // da mesma verdade, que é justamente o que causava incoerência antes.
}

// Cada horário de cada remédio vira uma dose do dia. Não é guardada: é
// montada a partir dos remédios toda vez que a tela de Início abre.
export interface Dose {
  remedio: Remedio;
  horario: string;
}

// Em que pé está uma dose de hoje, do ponto de vista do usuário:
// - aguardando: falta mais de uma hora, ainda não dá para confirmar
// - liberada: está na janela do horário, é a hora de tomar
// - atrasada: passou da tolerância e não foi confirmada
// - tomada: já foi confirmada hoje
export type SituacaoDaDose = 'aguardando' | 'liberada' | 'atrasada' | 'tomada';

// Os três desenhos que o pet pode ter na tela de Início.
export type EstadoDoPet = 'saudavel' | 'abatido' | 'doente';
