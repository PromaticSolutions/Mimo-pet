import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string | null;
  crystals: number;
  diamonds: number; // Mapeado para 'ouros' no Supabase
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

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, crystals, is_premium, ouros')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Error fetching profile:', error);
      return null;
    }
    
    // Se o perfil não for encontrado, retornamos um perfil básico
    if (!data) {
        console.log('Profile not found, returning basic profile structure.');
        return {
            id: userId,
            username: null,
            crystals: 0,
            diamonds: 0, // Mapeado para 'ouros'
            is_premium: false,
        } as Profile;
    }

    return {
        ...data,
        diamonds: data.ouros, // Mapeia 'ouros' para 'diamonds' no frontend
    } as Profile;
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({ ...prev, session, user: session?.user ?? null, loading: true }));

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setAuthState(prev => ({ ...prev, profile, loading: false }));
        } else {
          setAuthState(prev => ({ ...prev, profile: null, loading: false }));
        }
      }
    );

    // Initial check
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState(prev => ({ ...prev, session, user: session?.user ?? null, loading: true }));

        if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setAuthState(prev => ({ ...prev, profile, loading: false }));
        } else {
            setAuthState(prev => ({ ...prev, loading: false }));
        }
    };

    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { ...authState, refetchProfile: () => authState.user && fetchProfile(authState.user.id) };
};
