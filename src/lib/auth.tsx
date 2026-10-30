import type { Session } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { supabase } from './supabase';

type Auth = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<Auth>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  return useContext(AuthContext);
}

/** Traduit les erreurs Supabase les plus courantes. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (m.includes('email not confirmed')) return 'Confirme d’abord ton email grâce au lien reçu.';
  if (m.includes('already registered')) return 'Un compte existe déjà avec cet email.';
  if (m.includes('password should be at least')) return 'Le mot de passe doit faire au moins 6 caractères.';
  if (m.includes('invalid') && m.includes('email')) return 'Adresse email invalide.';
  if (m.includes('rate limit')) return 'Trop de tentatives, réessaie dans quelques minutes.';
  if (m.includes('network') || m.includes('fetch')) return 'Pas de connexion internet.';
  return message;
}
