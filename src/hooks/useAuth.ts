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
        .select('id, username, crystals, diamonds, is_premium') // CORRIGIDO: Selecionando 'diamonds'
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é "no rows found"
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

      // O objeto 'data' já contém as colunas corretas (id, username, crystals, diamonds, is_premium)
      return data as Profile;
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
          if (mounted.current) {
            setAuthState({
              session,
              user: session.user,
              profile,
              loading: false,
              error: null,
            });
          }
        } else {
          if (mounted.current) {
            setAuthState({
              session: null,
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (err) {
        console.error('Erro ao carregar sessão inicial:', err);
        if (mounted.current) setAuthState(prev => ({ ...prev, loading: false, error: 'Erro ao carregar sessão' }));
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      // Garante que o estado de loading seja false em qualquer mudança de estado de autenticação
      if (['SIGNED_IN', 'TOKEN_REFRESHED', 'SIGNED_OUT', 'INITIAL_SESSION'].includes(event)) {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted.current) {
            setAuthState({
              session,
              user: session.user,
              profile,
              loading: false,
              error: null,
            });
          }
        } else {
          if (mounted.current) {
            setAuthState({
              session: null,
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
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
      setAuthState(prev => ({ ...prev, loading: false, error: 'Email ou senha inválidos.' }));
      return;
    }
  };

  const signUpEmailPassword = async (email: string, password: string, username: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    // Primeiro tenta criar a conta
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Erro ao criar conta. Email já cadastrado?' }));
      return;
    }

    if (data.user) {
      // Cria perfil padrão
      // Usamos a coluna 'diamonds' que agora é consistente com o código e o novo esquema SQL
      const { error: profileError } = await supabase.from('profiles').insert([{ id: data.user.id, username, crystals: 0, diamonds: 0, is_premium: false }]);
      
      if (profileError) {
        // Se falhar ao criar o perfil, loga o erro e tenta logar o usuário (caso o perfil já exista)
        console.error('Erro ao criar perfil após signup:', profileError);
      }

      // Loga automaticamente (necessário para que o authListener pegue a sessão completa)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'Conta criada mas não foi possível logar automaticamente.' }));
        return;
      }
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
