import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY son requeridos');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Launches Google OAuth via Supabase + expo-web-browser.
 * Returns the Supabase access_token on success, or throws.
 */
export async function signInWithGoogle(): Promise<string> {
  const redirectUrl = 'guspad://auth/callback';

  const { data, error: initError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (initError || !data?.url) {
    throw new Error(initError?.message ?? 'No se pudo iniciar Google OAuth');
  }

  // Timeout de 2 minutos para que no quede cargando infinito
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Tiempo de espera agotado. Intentá de nuevo.')), 120000)
  );

  const browserPromise = WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  const result = await Promise.race([browserPromise, timeoutPromise]) as WebBrowser.WebBrowserAuthSessionResult;

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Inicio de sesión cancelado');
  }

  if (result.type !== 'success' || !result.url) {
    throw new Error(`Error en autenticación (tipo: ${result.type})`);
  }

  const callbackUrl = result.url;
  console.log('[Google OAuth] Callback URL:', callbackUrl);

  const fragment = callbackUrl.split('#')[1] ?? '';
  const query = callbackUrl.split('?')[1]?.split('#')[0] ?? '';
  const fragmentParams = new URLSearchParams(fragment);
  const queryParams = new URLSearchParams(query);

  // Detectar error de Supabase/Google antes de buscar el token
  const callbackError = fragmentParams.get('error') ?? queryParams.get('error');
  const callbackErrorDesc = fragmentParams.get('error_description') ?? queryParams.get('error_description');
  if (callbackError) {
    throw new Error(callbackErrorDesc ? decodeURIComponent(callbackErrorDesc) : `Error OAuth: ${callbackError}`);
  }

  const accessToken = fragmentParams.get('access_token') ?? queryParams.get('access_token');

  if (!accessToken) {
    throw new Error('No se recibió token de acceso');
  }

  return accessToken;
}
