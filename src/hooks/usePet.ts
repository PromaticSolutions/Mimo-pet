import { useState, useEffect, useCallback } from 'react';
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

  const fetchPet = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
        throw new Error(error.message);
      }

      if (data) {
        setPet(data as Pet);
      } else {
        // Se não houver pet, sugerimos a criação
        setPet(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPet(user.id);
    } else if (!authLoading && !user) {
      setPet(null);
      setLoading(false);
    }
  }, [user, authLoading, fetchPet]);

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
    }
  };

  return { pet, loading, error, fetchPet: () => user && fetchPet(user.id), createPet, updatePetStats };
};
