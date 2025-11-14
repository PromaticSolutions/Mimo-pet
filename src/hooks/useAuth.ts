import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string | null;
  crystals: number;
  diamonds: number;
  is_premium: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const mounted = useRef(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, crystals, is_premium, ouros')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (!data) {
        return {
          id: userId,
          username: null,
          crystals: 0,
          diamonds: 0,
          is_premium: false,
        };
      }

      return {
        ...data,
        diamonds: data.ouros ?? 0,
      };
    } catch (err) {
      console.error('Erro inesperado em fetchProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    mounted.current = true;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted.current) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted.current) setAuthState({ session, user: session.user, profile, loading: false, error: null });
        } else {
          if (mounted.current) setAuthState({ session: null, user: null, profile: null, loading: false, error: null });
        }
      } catch (err) {
        console.error('Erro ao carregar sessão inicial:', err);
        if (mounted.current) setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      if (['SIGNED_IN', 'TOKEN_REFRESHED', 'SIGNED_OUT'].includes(event)) {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted.current) setAuthState({ session, user: session.user, profile, loading: false, error: null });
        } else {
          if (mounted.current) setAuthState({ session: null, user: null, profile: null, loading: false, error: null });
        }
      }
    });

    return () => {
      mounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInEmailPassword = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Conta não encontrada ou senha incorreta.' }));
    }
  };

  const signUpEmailPassword = async (email: string, password: string, username: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      return;
    }

    if (data.user) {
      // Cria perfil padrão
      await supabase.from('profiles').insert([{ id: data.user.id, username, crystals: 0, diamonds: 0, is_premium: false }]);
      // Loga automaticamente após criar
      await signInEmailPassword(email, password);
    }
  };

  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return {
    ...authState,
    signInEmailPassword,
    signUpEmailPassword,
    signInGoogle
  };
};
