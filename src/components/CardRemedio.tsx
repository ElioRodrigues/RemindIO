import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';
import { Remedio } from '../types';

export interface CardRemedioProps {
  remedio: Remedio;
  aoPressionar(): void;
}

export function CardRemedio(props: CardRemedioProps) {
  // Os horários são poucos, então junto todos em um texto só.
  const horariosEmTexto = props.remedio.horarios.join('   ');

  return (
    <Pressable onPress={props.aoPressionar}>
      <View style={styles.caixa}>
        <Text style={styles.nome}>{props.remedio.nome}</Text>
        <Text style={styles.dosagem}>{props.remedio.dosagem}</Text>
        <Text style={styles.horarios}>{horariosEmTexto}</Text>

        {/* Só os remédios em ciclo têm intervalo maior que zero. */}
        {props.remedio.intervaloEmHoras > 0 ? (
          <Text style={styles.ciclo}>
            a cada {props.remedio.intervaloEmHoras} horas
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: CORES.gelo,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.sol,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORES.noite,
  },
  dosagem: {
    fontSize: 14,
    color: CORES.roxo,
    marginTop: 2,
  },
  horarios: {
    fontSize: 16,
    color: CORES.coral,
    marginTop: 8,
  },
  ciclo: {
    fontSize: 12,
    color: CORES.roxo,
    marginTop: 4,
  },
});
