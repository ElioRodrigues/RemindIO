import * as Progress from 'react-native-progress';
import { StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';

export interface BarraSaudeProps {
  saude: number;
}

export function BarraSaude(props: BarraSaudeProps) {
  // A cor segue as mesmas faixas que decidem o desenho do pet na tela de
  // Início: assim a barra e o urso nunca contam histórias diferentes.
  let cor = CORES.menta;
  if (props.saude < 30) {
    cor = CORES.roxo;
  } else if (props.saude <= 60) {
    cor = CORES.sol;
  }

  // A barra trabalha de 0 a 1, mas a saúde do pet é de 0 a 100.
  const progresso = props.saude / 100;

  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        <Text style={styles.rotulo}>Saúde do pet</Text>
        <Text style={styles.valor}>{props.saude}%</Text>
      </View>

      <Progress.Bar
        progress={progresso}
        width={null}
        height={14}
        color={cor}
        unfilledColor={CORES.gelo}
        borderColor={CORES.roxo}
        borderRadius={12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rotulo: {
    fontSize: 14,
    color: CORES.noite,
  },
  valor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CORES.noite,
  },
});
