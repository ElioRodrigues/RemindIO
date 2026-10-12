import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Remedio } from '../types';
import { lerPet, listarRemedios } from './storage';

// No Android toda notificação pertence a um "canal". O usuário pode ligar,
// desligar ou mudar o som de cada canal nas configurações do aparelho.
const CANAL_DOS_LEMBRETES = 'lembretes';

// Prepara as notificações. Chamada uma vez, quando o app abre já logado.
export async function configurarNotificacoes() {
  // Por padrão, uma notificação que chega com o app ABERTO não aparece.
  // Este "manipulador" diz ao sistema para mostrar o aviso e tocar o som
  // mesmo assim: quem está mexendo no app também precisa saber da dose.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    try {
      // HIGH faz o aviso descer do topo da tela, e não só aparecer na
      // barra de notificações. Criar um canal que já existe não dá erro.
      await Notifications.setNotificationChannelAsync(CANAL_DOS_LEMBRETES, {
        name: 'Lembretes de remédio',
        importance: Notifications.AndroidImportance.HIGH,
      });
    } catch (erro) {
      console.log('Erro ao criar o canal de notificação', erro);
    }
  }
}

// true quando o app pode mostrar notificações. Só consulta: não pede nada.
// Usada pelos Ajustes para mostrar "Ligados" ou "Desligados".
export async function lembretesPermitidos(): Promise<boolean> {
  try {
    const permissao = await Notifications.getPermissionsAsync();
    return permissao.granted;
  } catch (erro) {
    console.log('Erro ao consultar a permissão de notificação', erro);
    return false;
  }
}

// Pede a permissão, se ainda der para pedir. Devolve se ficou permitido.
async function garantirPermissao(): Promise<boolean> {
  const permissao = await Notifications.getPermissionsAsync();

  if (permissao.granted) {
    return true;
  }

  // canAskAgain é false quando o usuário já negou e o sistema não mostra
  // mais a janela. Aí só dá para liberar nas configurações (ver Ajustes).
  if (!permissao.canAskAgain) {
    return false;
  }

  const resposta = await Notifications.requestPermissionsAsync();
  return resposta.granted;
}

// Apaga TODOS os lembretes agendados e agenda de novo, um por horário de
// cada remédio.
// Por que refazer tudo, e não só o remédio que mudou? Porque assim a lista
// de remédios é a única fonte da verdade, como a saúde do pet: não existe
// jeito de sobrar um lembrete de um horário que foi apagado na edição.
async function reagendarLembretes(remedios: Remedio[], nomeDoPet: string) {
  try {
    const permitido = await garantirPermissao();

    // Os antigos saem mesmo sem permissão: não faz sentido guardar
    // lembretes de uma lista que pode já ter mudado.
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!permitido) {
      return;
    }

    for (let i = 0; i < remedios.length; i++) {
      const remedio = remedios[i];

      for (let j = 0; j < remedio.horarios.length; j++) {
        const horario = remedio.horarios[j];
        // "08:30" vira hora 8 e minuto 30, que é o que o gatilho espera.
        const partes = horario.split(':');

        await Notifications.scheduleNotificationAsync({
          content: {
            title: remedio.nome + ', ' + remedio.dosagem,
            body: 'Dose das ' + horario + '. Confirme no app: ' + nomeDoPet + ' conta com você.',
          },
          // DAILY repete todo dia na mesma hora, para sempre, mesmo com o
          // app fechado: quem dispara é o sistema, não o app.
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: Number(partes[0]),
            minute: Number(partes[1]),
            channelId: CANAL_DOS_LEMBRETES,
          },
        });
      }
    }
  } catch (erro) {
    console.log('Erro ao agendar lembretes', erro);
  }
}

// O que as telas chamam: lê os remédios e o pet da conta logada e refaz os
// lembretes. Usada ao entrar no app e depois de cadastrar, editar ou
// excluir um remédio.
export async function atualizarLembretes() {
  const remedios = await listarRemedios();
  const pet = await lerPet();

  await reagendarLembretes(remedios, pet === null ? 'Pipo' : pet.nome);
}

// Ao sair da conta, os lembretes dela param. Sem isso, o celular
// continuaria avisando dos remédios de quem saiu.
export async function cancelarLembretes() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (erro) {
    console.log('Erro ao cancelar lembretes', erro);
  }
}
