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
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  const mounted = useRef(true);

  const fetchProfile = async (userId: string) => {
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
        console.log('Perfil não encontrado, criando perfil padrão...');
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
        setAuthState(prev => ({ ...prev, session, user: session?.user ?? null, loading: true }));

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted.current) {
            setAuthState(prev => ({ ...prev, profile, loading: false }));
          }
        } else {
          if (mounted.current) setAuthState(prev => ({ ...prev, loading: false }));
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
        setAuthState(prev => ({ ...prev, session, user: session?.user ?? null, loading: true }));

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted.current) setAuthState(prev => ({ ...prev, profile, loading: false }));
        } else {
          if (mounted.current) setAuthState(prev => ({ ...prev, profile: null, loading: false }));
        }
      }
    });

    return () => {
      mounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    ...authState,
    refetchProfile: async () => {
      if (authState.user) {
        const profile = await fetchProfile(authState.user.id);
        setAuthState(prev => ({ ...prev, profile }));
      }
    },
  };
};
