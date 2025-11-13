import { useState, useEffect } from 'react';
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

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, crystals, is_premium, ouros')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    if (!data) {
      console.log('Profile not found, returning basic profile structure.');
      return {
        id: userId,
        username: null,
        crystals: 0,
        diamonds: 0,
        is_premium: false,
      } as Profile;
    }

    return {
      ...data,
      diamonds: data.ouros,
    } as Profile;
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setAuthState({
              session,
              user: session.user,
              profile,
              loading: false,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              session: null,
              user: null,
              profile: null,
              loading: false,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            if (mounted) {
              setAuthState({
                session,
                user: session.user,
                profile,
                loading: false,
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setAuthState({
              session: null,
              user: null,
              profile: null,
              loading: false,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { 
    ...authState, 
    refetchProfile: async () => {
      if (authState.user) {
        const profile = await fetchProfile(authState.user.id);
        setAuthState(prev => ({ ...prev, profile }));
        return profile;
      }
      return null;
    }
  };
};