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

      if (error && error.code !== 'PGRST116') return null;

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
    } catch {
      return null;
    }
  };

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Sessão inicial:', session);

      let profile: Profile | null = null;
      if (session?.user) {
        profile = await fetchProfile(session.user.id);
      }

      if (mounted.current) {
        setAuthState({
          session,
          user: session?.user ?? null,
          profile,
          loading: false,
        });
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event);
      if (!mounted.current) return;

      let profile: Profile | null = null;
      if (session?.user) profile = await fetchProfile(session.user.id);

      if (mounted.current) {
        setAuthState({
          session,
          user: session?.user ?? null,
          profile,
          loading: false,
        });
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
