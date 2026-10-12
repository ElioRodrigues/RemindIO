import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';
import { Remedio } from '../types';

export interface CardRemedioProps {
  remedio: Remedio;
  aoPressionar(): void;
}

export function CardRemedio(props: CardRemedioProps) {
  return (
    <Pressable
      onPress={props.aoPressionar}
      style={({ pressed }) => [styles.caixa, pressed ? styles.pressionado : null]}
    >
      {/* O espaço da foto do remédio. Por enquanto um ícone; a foto da
          caixa entra aqui quando a câmera for adicionada. */}
      <View style={styles.foto}>
        <MaterialIcons name="medication" size={28} color={CORES.lavanda} />
      </View>

      <View style={styles.conteudo}>
        <Text style={styles.nome}>{props.remedio.nome}</Text>
        <Text style={styles.dosagem}>
          {props.remedio.dosagem}
          {/* Só os remédios em ciclo têm intervalo maior que zero. */}
          {props.remedio.intervaloEmHoras > 0
            ? ', a cada ' + props.remedio.intervaloEmHoras + ' horas'
            : ''}
        </Text>

        {/* Os horários são poucos e fixos, então map resolve: não precisa
            de FlatList para uma lista de 2 ou 3 itens. */}
        <View style={styles.horarios}>
          {props.remedio.horarios.map((horario) => (
            // O fundo arredondado fica numa View, e não no Text: no
            // Android o Text com fundo e borda arredondada sai com altura
            // irregular.
            <View key={horario} style={styles.capsula}>
              <Text style={styles.horario}>{horario}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    backgroundColor: CORES.branco,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  pressionado: {
    backgroundColor: CORES.lavandaClara,
  },
  foto: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: CORES.lavandaClara,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  conteudo: {
    flex: 1,
  },
  nome: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    lineHeight: 26,
    color: CORES.ameixa,
  },
  dosagem: {
    fontFamily: FONTES.texto,
    fontSize: 15,
    color: CORES.ameixaSuave,
  },
  horarios: {
    flexDirection: 'row',
    // flexWrap deixa os horários descerem para a linha de baixo quando
    // não cabem, em vez de saírem da tela.
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  capsula: {
    backgroundColor: CORES.lavandaClara,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  horario: {
    fontFamily: FONTES.textoForte,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixa,
  },
});
