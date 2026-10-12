import { StyleSheet, Text, View } from 'react-native';
import { CORES } from '../constants/cores';
import { FONTES, TAMANHOS } from '../constants/fontes';
import { diaDaSemanaEData } from '../services/datas';
import { ResumoDoDia } from '../types';

export interface DiaDoHistoricoProps {
  dia: ResumoDoDia;
}

// A cor diz como foi o dia, com as mesmas cores da cartela: sálvia é
// "tomou tudo", âmbar é "tomou parte", framboesa é "perdeu a maioria".
function corDaPorcentagem(porcentagem: number): string {
  if (porcentagem === 100) {
    return CORES.salvia;
  }
  if (porcentagem >= 50) {
    return CORES.ambar;
  }
  return CORES.framboesa;
}

// O detalhe embaixo da data: "3 de 4 tomadas · 1 atrasada".
// Só fala de atraso quando houve atraso, para a linha ficar curta.
function textoDoDetalhe(dia: ResumoDoDia): string {
  const tomadas = dia.noHorario + dia.atrasadas;
  let texto = tomadas + ' de ' + dia.previstas + ' tomadas';

  if (dia.atrasadas === 1) {
    texto = texto + ' · 1 atrasada';
  } else if (dia.atrasadas > 1) {
    texto = texto + ' · ' + dia.atrasadas + ' atrasadas';
  }

  return texto;
}

// Uma linha do histórico: a data, o detalhe, a porcentagem e uma barra.
export function DiaDoHistorico(props: DiaDoHistoricoProps) {
  const cor = corDaPorcentagem(props.dia.porcentagem);

  return (
    <View style={styles.caixa}>
      <View style={styles.linha}>
        <View>
          <Text style={styles.data}>{diaDaSemanaEData(props.dia.data)}</Text>
          <Text style={styles.detalhe}>{textoDoDetalhe(props.dia)}</Text>
        </View>
        <Text style={[styles.porcentagem, { color: cor }]}>
          {props.dia.porcentagem}%
        </Text>
      </View>

      {/* A barra é só uma View dentro da outra: a de fora é o trilho, a de
          dentro tem a largura da porcentagem (75%). Não precisa de
          biblioteca para isso. */}
      <View style={styles.trilho}>
        <View
          style={[
            styles.preenchimento,
            // Crase em vez de aspas (template string): assim o TypeScript
            // sabe que o texto é sempre "número%", o único formato de
            // porcentagem que o width aceita. Com + '%' ele só veria texto.
            { width: `${props.dia.porcentagem}%`, backgroundColor: cor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: CORES.branco,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  data: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
    lineHeight: 26,
    color: CORES.ameixa,
  },
  detalhe: {
    fontFamily: FONTES.texto,
    fontSize: TAMANHOS.detalhe,
    color: CORES.ameixaSuave,
  },
  porcentagem: {
    fontFamily: FONTES.titulo,
    fontSize: TAMANHOS.destaque,
  },
  trilho: {
    height: 8,
    borderRadius: 999,
    backgroundColor: CORES.lavandaClara,
    // overflow hidden corta o preenchimento nas bordas arredondadas.
    overflow: 'hidden',
  },
  preenchimento: {
    height: 8,
    borderRadius: 999,
  },
});
