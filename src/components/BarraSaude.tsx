import * as Progress from 'react-native-progress';
import { CORES } from '../constants/cores';
import { estadoDoPet } from '../services/pet';

export interface BarraSaudeProps {
  saude: number;
}

// A cor de cada estado do pet: verde saudável, âmbar abatido, framboesa doente.
const COR_DO_ESTADO = {
  saudavel: CORES.salvia,
  abatido: CORES.ambar,
  doente: CORES.framboesa,
};

export function BarraSaude(props: BarraSaudeProps) {
  // A cor vem do mesmo estadoDoPet que escolhe o desenho do urso. Antes as
  // faixas 30 e 60 estavam escritas aqui também, e podiam se desencontrar.
  const cor = COR_DO_ESTADO[estadoDoPet(props.saude)];

  // A barra trabalha de 0 a 1, mas a saúde do pet é de 0 a 100.
  const progresso = props.saude / 100;

  return (
    <Progress.Bar
      progress={progresso}
      // width null faz a barra ocupar toda a largura disponível.
      width={null}
      height={12}
      color={cor}
      unfilledColor={CORES.branco}
      borderWidth={0}
      borderRadius={999}
    />
  );
}
