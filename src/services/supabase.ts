// O supabase-js usa a classe URL, que o React Native não tem completa.
// Este import completa; precisa vir antes de tudo.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Vêm do .env. A chave é a pública: quem protege os dados é o RLS do banco.
const ENDERECO = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const CHAVE_PUBLICA = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

// O cliente: por ele passam o login (auth), as tabelas (from) e as fotos
// (storage). Criado uma vez e importado onde precisar.
export const supabase = createClient(ENDERECO, CHAVE_PUBLICA, {
  auth: {
    // Guarda o login no aparelho, para o app abrir já logado.
    storage: AsyncStorage,
    persistSession: true,
    // O token vence em 1 hora; o cliente renova sozinho.
    autoRefreshToken: true,
    // Só serve no navegador.
    detectSessionInUrl: false,
  },
});

// Só renova o token com o app aberto na tela (como na documentação do
// Supabase para React Native).
AppState.addEventListener('change', (estado) => {
  if (estado === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
