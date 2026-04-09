import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

// Completes the OAuth session when the app resumes
WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = 'https://ugfhasfzskjqnxrinpcu.supabase.co';
// Anon (public) key — safe to expose in mobile apps
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZmhhc2Z6c2tqcW54cmducGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzIxMTQsImV4cCI6MjA1OTIwODExNH0.OsL5nRPfjFUHVsFAFAeNQ7lNUPxfzXJK2dqNAGVrm10';

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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    throw new Error(error?.message ?? 'No se pudo iniciar Google OAuth');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Inicio de sesión cancelado');
  }

  // Extract access_token from the callback URL fragment
  const url = result.url;
  const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '');
  const accessToken = params.get('access_token');

  if (!accessToken) {
    throw new Error('No se recibió token de Google');
  }

  return accessToken;
}
