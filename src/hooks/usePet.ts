import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Pet {
  id: string;
  user_id: string;
  name: string;
  level: number;
  energy: number;
  happiness: number;
  last_fed: string;
  last_played: string;
}

export const usePet = () => {
  const { user, loading: authLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchPet = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      if (!mounted.current) return;

      if (data) {
        setPet(data as Pet);
      } else {
        setPet(null);
      }
    } catch (err) {
      console.error('Erro ao buscar pet:', err);
      if (mounted.current) setError('Erro ao buscar dados do pet.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;

    if (!authLoading) {
      if (user) fetchPet(user.id);
      else {
        setPet(null);
        setLoading(false);
      }
    }

    return () => {
      mounted.current = false;
    };
  }, [user, authLoading]);

  const createPet = async (name: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([{ user_id: user.id, name }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      setPet(data as Pet);
    } catch (err) {
      setError('Erro ao criar pet');
    } finally {
      setLoading(false);
    }
  };

  const updatePetStats = async (updates: Partial<Omit<Pet, 'id' | 'user_id'>>) => {
    if (!pet) return;

    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', pet.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setPet(data as Pet);
    } catch (err) {
      setError('Erro ao atualizar pet');
    }
  };

  return { pet, loading, error, fetchPet: () => user && fetchPet(user.id), createPet, updatePetStats };
};
