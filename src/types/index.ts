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

// Os três desenhos que o pet pode ter na tela de Início.
export type EstadoDoPet = 'saudavel' | 'abatido' | 'doente';
