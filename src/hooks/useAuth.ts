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
        diamonds: data.ouros ?? 0, // mapear "ouros" para "diamonds"
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
      console.log('🔐 Session:', session);

      if (!mounted.current) return;

      // ❌ REMOVA ESTA LINHA - NÃO SETE loading: true aqui
      // setAuthState(prev => ({ ...prev, session, user: session?.user ?? null, loading: true }));

      if (session?.user) {
        console.log('🔐 Fetching profile for user:', session.user.id);
        const profile = await fetchProfile(session.user.id);
        if (mounted.current) {
          // ✅ Sete TUDO de uma vez, incluindo loading: false
          setAuthState({
            session,
            user: session.user,
            profile,
            loading: false
          });
          console.log('🔐 Auth carregado com sucesso!');
        }
      } else {
        if (mounted.current) {
          setAuthState({
            session: null,
            user: null,
            profile: null,
            loading: false
          });
          console.log('🔐 Sem sessão, loading: false');
        }
      }
    } catch (err) {
      console.error('🔐 Erro ao carregar sessão inicial:', err);
      if (mounted.current) setAuthState(prev => ({ ...prev, loading: false }));
    }

    // Teste de conexão Supabase
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      if (error) console.error('Erro ao conectar Supabase:', error);
      else console.log('✅ Conexão Supabase OK:', data);
    } catch (err) {
      console.error('Erro inesperado no teste de conexão:', err);
    }
  };

  getInitialSession();

  return () => {
    mounted.current = false;
  };
}, []);

    getInitialSession();

    // Listener de auth
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
