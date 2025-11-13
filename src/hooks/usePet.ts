import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let mounted = true;

    const fetchPet = async (userId: string) => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!mounted) return;

        if (error && error.code !== 'PGRST116') {
          throw new Error(error.message);
        }

        setPet(data ? (data as Pet) : null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch pet data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      fetchPet(user.id);
    } else if (!authLoading && !user) {
      setPet(null);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  const createPet = async (name: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([{ user_id: user.id, name }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setPet(data as Pet);
      return data as Pet;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePetStats = async (updates: Partial<Omit<Pet, 'id' | 'user_id'>>) => {
    if (!pet) {
      setError('Pet not found');
      return;
    }
    
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', pet.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setPet(data as Pet);
      return data as Pet;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pet stats');
      throw err;
    }
  };

  const refetchPet = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      setPet(data ? (data as Pet) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pet data');
    } finally {
      setLoading(false);
    }
  };

  return { 
    pet, 
    loading, 
    error, 
    createPet, 
    updatePetStats,
    refetchPet 
  };
};