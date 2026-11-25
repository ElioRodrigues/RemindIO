import { Alert } from 'react-native';

// Os services lançam o erro (throw) e a tela mostra o aviso com avisarErro.

// Troca os erros mais comuns do Supabase (em inglês) por uma frase em
// português.
export function mensagemDoErro(erro: unknown): string {
  // Erros do Supabase têm message e, às vezes, code.
  const { message, code } = (erro ?? {}) as { message?: string; code?: string };
  const texto = message ?? '';

  if (texto.includes('Network request failed') || texto.includes('Failed to fetch')) {
    return 'Sem conexão com a internet. Confira a rede e tente de novo.';
  }

  if (code === 'invalid_credentials') {
    // Não diz qual dos dois está errado para não revelar quem tem conta.
    return 'E-mail ou senha incorretos. Confira os dois e tente de novo.';
  }

  if (code === 'user_already_exists' || code === 'email_exists') {
    return 'Este e-mail já tem conta. Volte e entre com ele, ou use outro e-mail.';
  }

  if (code === 'email_not_confirmed') {
    return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  }

  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  }

  if (code === 'weak_password') {
    return 'Senha fraca. Use pelo menos 6 caracteres.';
  }

  // Qualquer outro: frase genérica, e o detalhe vai para o terminal.
  console.log('Erro sem tradução', erro);
  return 'Algo deu errado ao falar com o servidor. Tente de novo.';
}

// Chamada no catch das telas.
export function avisarErro(titulo: string, erro: unknown) {
  Alert.alert(titulo, mensagemDoErro(erro));
}
